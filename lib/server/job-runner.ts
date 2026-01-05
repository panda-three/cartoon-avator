import "server-only"

import { generateImagesForJob } from "@/lib/server/generate-images"
import { getJobRecord, updateJobRecord } from "@/lib/server/job-store"
import { recordSuccessfulJobCharge } from "@/lib/server/billing-store"

const pendingQueue: string[] = []
const enqueued = new Set<string>()

let isProcessing = false

function normalizeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return "生成失败，请稍后重试"
}

export function enqueueJob(jobId: string) {
  if (enqueued.has(jobId)) return
  enqueued.add(jobId)
  pendingQueue.push(jobId)
  void processQueue()
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
    await updateJobRecord(jobId, (prev) => ({
      ...prev,
      status: "running",
      error: null,
      outputImageUrls: [],
      updatedAt: startedAt,
    }))

    try {
      const images = await generateImagesForJob({
        inputImageUrl: job.inputImageUrl,
        stylePackId: job.stylePackId,
        identityStrength: job.params.identityStrength,
        provider: job.provider,
      })

      const doneAt = new Date().toISOString()
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
    } catch (err) {
      const failedAt = new Date().toISOString()
      await updateJobRecord(jobId, (prev) => {
        if (prev.status === "canceled") return { ...prev, updatedAt: failedAt }
        return {
          ...prev,
          status: "failed",
          error: { message: normalizeErrorMessage(err) },
          updatedAt: failedAt,
        }
      })
    }
  }

  isProcessing = false
}
