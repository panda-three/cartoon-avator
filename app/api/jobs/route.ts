import { NextResponse } from "next/server"
import { z } from "zod"
import { getStylePackById } from "@/lib/style-packs"
import {
  cloneJobFromSource,
  createJob,
  deleteJobsForUser,
  getActiveJobIdForUser,
  getJobRecord,
  getJobRetentionDays,
  listJobsPublicForUser,
} from "@/lib/server/job-store"
import { enqueueJob } from "@/lib/server/job-runner"
import { getOpenRouterApiKey } from "@/lib/server/openrouter"
import { getUserId } from "@/lib/server/auth"
import { getEntitlementForUser } from "@/lib/server/billing-store"
import { MAX_UPLOAD_BYTES, allowedUploadTypeLabel, isAllowedUploadMimeType } from "@/lib/images"
import type { JobProvider } from "@/lib/jobs"
import { trackEvent } from "@/lib/server/telemetry"

export const runtime = "nodejs"

function isProductionDeploy(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production"
  return process.env.NODE_ENV === "production"
}

function parseLimit(req: Request): number {
  const url = new URL(req.url)
  const raw = url.searchParams.get("limit")
  const parsed = z.number().int().min(1).max(30).catch(30).parse(raw ? Number.parseInt(raw, 10) : undefined)
  return parsed
}

function pickProvider(): JobProvider {
  if (process.env.OPENROUTER_MOCK === "1") return "mock"
  return getOpenRouterApiKey() ? "openrouter" : "mock"
}

function parseIntField(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer())
  const mime = file.type || "application/octet-stream"
  return `data:${mime};base64,${buf.toString("base64")}`
}

export async function GET(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "缺少用户身份" }, { status: 401 })

  const limit = parseLimit(req)
  const jobs = await listJobsPublicForUser({ userId, limit })
  const retentionDays = getJobRetentionDays()

  return NextResponse.json({ jobs, retentionDays })
}

export async function DELETE() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "缺少用户身份" }, { status: 401 })

  const deleted = await deleteJobsForUser(userId)
  return NextResponse.json({ deleted })
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "缺少用户身份，请刷新页面后重试" }, { status: 401 })
  }

  const entitlement = await getEntitlementForUser(userId)
  const subStatus = entitlement.subscription?.status ?? "inactive"
  if (subStatus === "inactive" || subStatus === "expired") {
    trackEvent("job.create_blocked", { userId, reason: "subscription_inactive", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "需要订阅后才能创建任务" }, { status: 403 })
  }
  if (subStatus === "past_due") {
    trackEvent("job.create_blocked", { userId, reason: "subscription_past_due", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "订阅扣款失败或已暂停，请先处理账单" }, { status: 403 })
  }
  if (entitlement.usage.quotaRemaining <= 0) {
    trackEvent("job.create_blocked", { userId, reason: "quota_exhausted", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "本月额度已用完" }, { status: 403 })
  }

  const activeJobId = await getActiveJobIdForUser(userId)
  if (activeJobId) {
    trackEvent("job.create_blocked", { userId, reason: "concurrency_limit", activeJobId })
    return NextResponse.json({ error: "你已有一个进行中的任务，请等待完成后再创建", activeJobId }, { status: 409 })
  }

  const formData = await req.formData()

  const stylePackId = formData.get("stylePackId")
  const identityStrengthRaw = parseIntField(formData.get("identityStrength"))
  const sourceJobId = formData.get("sourceJobId")
  const image = formData.get("image")

  if (typeof stylePackId !== "string") {
    return NextResponse.json({ error: "缺少 stylePackId" }, { status: 400 })
  }

  const pack = getStylePackById(stylePackId)
  if (!pack?.isActive) {
    return NextResponse.json({ error: "风格包不可用" }, { status: 400 })
  }

  const identityStrength = z.number().int().min(0).max(100).catch(30).parse(identityStrengthRaw ?? 30)
  const provider = pickProvider()
  if (provider === "mock" && process.env.OPENROUTER_MOCK !== "1" && isProductionDeploy()) {
    trackEvent("job.create_blocked", { userId, reason: "openrouter_unconfigured" })
    return NextResponse.json({ error: "未配置 OPENROUTER_API_KEY，无法开始生成" }, { status: 500 })
  }

  if (image instanceof File) {
    if (!isAllowedUploadMimeType(image.type)) {
      return NextResponse.json({ error: `请上传 ${allowedUploadTypeLabel()} 图片` }, { status: 400 })
    }
    if (image.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "图片过大，请上传不超过 10MB 的图片" }, { status: 400 })
    }

    const inputImageUrl = await fileToDataUrl(image)
    const job = await createJob({
      stylePackId,
      params: { identityStrength },
      inputImageUrl,
      provider,
      userId,
    })

    trackEvent("job.created", {
      jobId: job.id,
      userId,
      stylePackId,
      provider,
      identityStrength,
      source: "upload",
    })
    enqueueJob(job.id)
    return NextResponse.json({ jobId: job.id }, { status: 201 })
  }

  if (typeof sourceJobId === "string") {
    const source = await getJobRecord(sourceJobId)
    if (!source || source.userId !== userId) {
      return NextResponse.json({ error: "源任务不存在或已被清理" }, { status: 400 })
    }

    const job = await cloneJobFromSource({
      sourceJobId,
      stylePackId,
      params: { identityStrength },
      provider,
      userId,
    })

    if (!job) {
      return NextResponse.json({ error: "源任务不存在或已被清理" }, { status: 400 })
    }

    trackEvent("job.created", {
      jobId: job.id,
      userId,
      stylePackId,
      provider,
      identityStrength,
      source: "clone",
      sourceJobId,
    })
    enqueueJob(job.id)
    return NextResponse.json({ jobId: job.id }, { status: 201 })
  }

  return NextResponse.json({ error: "请上传图片或提供 sourceJobId" }, { status: 400 })
}
