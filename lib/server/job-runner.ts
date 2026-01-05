import "server-only"

import { generateImagesForJob } from "@/lib/server/generate-images"
import { getJobRecord, updateJobRecord } from "@/lib/server/job-store"
import { recordSuccessfulJobCharge } from "@/lib/server/billing-store"
import { trackEvent } from "@/lib/server/telemetry"

const pendingQueue: string[] = []
const enqueued = new Set<string>()
const activeControllers = new Map<string, AbortController>()

const JOB_TIMEOUT_MS = (() => {
  const parsedMs = Number.parseInt(process.env.JOB_TIMEOUT_MS ?? "", 10)
  if (Number.isFinite(parsedMs) && parsedMs > 0) return parsedMs
  const parsedSeconds = Number.parseInt(process.env.JOB_TIMEOUT_SECONDS ?? "", 10)
  if (Number.isFinite(parsedSeconds) && parsedSeconds > 0) return parsedSeconds * 1000
  return 5 * 60_000
})()

let isProcessing = false

function normalizeError(err: unknown): { message: string; code?: string } {
  if (err instanceof Error) {
    const maybeCode = (err as { code?: unknown }).code
    return { message: err.message || "生成失败，请稍后重试", code: typeof maybeCode === "string" ? maybeCode : undefined }
  }
  return { message: "生成失败，请稍后重试" }
}

export function enqueueJob(jobId: string) {
  if (enqueued.has(jobId)) return
  enqueued.add(jobId)
  pendingQueue.push(jobId)
  void processQueue()
}

export function abortJob(jobId: string, reason?: unknown): boolean {
  const controller = activeControllers.get(jobId)
  if (!controller) return false
  controller.abort(reason)
  return true
}

async function processQueue() {
  if (isProcessing) return
  isProcessing = true

  while (pendingQueue.length) {
    const jobId = pendingQueue.shift()
    if (!jobId) continue
    enqueued.delete(jobId)

    const job = await getJobRecord(jobId)
    if (!job) continue
    if (job.status !== "queued") continue

    const startedAt = new Date().toISOString()
    const running = await updateJobRecord(jobId, (prev) => {
      if (prev.status !== "queued") return prev
      return {
        ...prev,
        status: "running",
        error: null,
        outputImageUrls: [],
        updatedAt: startedAt,
      }
    })
    if (!running || running.status !== "running") continue

    trackEvent("job.started", {
      jobId,
      provider: running.provider,
      stylePackId: running.stylePackId,
      attempt: running.attempt,
    })

    const controller = new AbortController()
    activeControllers.set(jobId, controller)
    const timeoutError = Object.assign(new Error("生成超时，请稍后重试"), { code: "JOB_TIMEOUT" })
    const timeout = setTimeout(() => controller.abort(timeoutError), JOB_TIMEOUT_MS)
    const startedAtMs = Date.now()

    try {
      const images = await generateImagesForJob({
        inputImageUrl: running.inputImageUrl,
        stylePackId: running.stylePackId,
        identityStrength: running.params.identityStrength,
        provider: running.provider,
        signal: controller.signal,
      })

      const doneAt = new Date().toISOString()
      const durationMs = Date.now() - startedAtMs
      const updated = await updateJobRecord(jobId, (prev) => {
        if (prev.status === "canceled") return { ...prev, updatedAt: doneAt }
        return {
          ...prev,
          status: "succeeded",
          outputImageUrls: images,
          updatedAt: doneAt,
        }
      })

      if (updated?.status === "succeeded" && updated.userId) {
        try {
          await recordSuccessfulJobCharge({ userId: updated.userId, jobId, chargedAt: doneAt })
          await updateJobRecord(jobId, (prev) =>
            prev.status === "succeeded" && !prev.chargedAt ? { ...prev, chargedAt: doneAt } : prev,
          )
        } catch (err) {
          console.error("[job-runner] failed to charge quota", err)
        }
      }

      if (updated?.status === "succeeded") {
        trackEvent("job.succeeded", {
          jobId,
          provider: updated.provider,
          stylePackId: updated.stylePackId,
          attempt: updated.attempt,
          durationMs,
        })
      } else if (updated?.status === "canceled") {
        trackEvent("job.canceled", {
          jobId,
          provider: running.provider,
          stylePackId: running.stylePackId,
          attempt: running.attempt,
          durationMs,
        })
      }
    } catch (err) {
      const failedAt = new Date().toISOString()
      const durationMs = Date.now() - startedAtMs
      const normalized = normalizeError(err)
      const updated = await updateJobRecord(jobId, (prev) => {
        if (prev.status === "canceled") return { ...prev, updatedAt: failedAt }
        return {
          ...prev,
          status: "failed",
          error: { message: normalized.message, ...(normalized.code ? { code: normalized.code } : {}) },
          updatedAt: failedAt,
        }
      })

      if (updated?.status === "canceled") {
        trackEvent("job.canceled", {
          jobId,
          provider: running.provider,
          stylePackId: running.stylePackId,
          attempt: running.attempt,
          durationMs,
        })
      } else {
        trackEvent("job.failed", {
          jobId,
          provider: running.provider,
          stylePackId: running.stylePackId,
          attempt: running.attempt,
          durationMs,
          errorCode: normalized.code ?? null,
          errorMessage: normalized.message,
        })
      }
    } finally {
      clearTimeout(timeout)
      activeControllers.delete(jobId)
    }
  }

  isProcessing = false
}
