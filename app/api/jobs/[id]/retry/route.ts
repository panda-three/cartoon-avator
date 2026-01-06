import { NextResponse } from "next/server"
import { getActiveJobIdForUser, getJobRecord, updateJobRecord } from "@/lib/server/job-store"
import { enqueueJob } from "@/lib/server/job-runner"
import { getUserId } from "@/lib/server/auth"
import { getEntitlementForUser } from "@/lib/server/billing-store"
import { trackEvent } from "@/lib/server/telemetry"

export const runtime = "nodejs"

function isProductionDeploy(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production"
  return process.env.NODE_ENV === "production"
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "缺少用户身份，请刷新页面后重试" }, { status: 401 })
  }

  const job = await getJobRecord(id)
  if (!job) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }
  if (job.userId !== userId) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }

  if (job.status !== "failed") {
    return NextResponse.json({ error: "当前状态不可重试" }, { status: 400 })
  }

  if (job.provider === "mock" && process.env.OPENROUTER_MOCK !== "1" && isProductionDeploy()) {
    trackEvent("job.retry_blocked", { userId, jobId: id, reason: "openrouter_unconfigured" })
    return NextResponse.json({ error: "当前任务为 mock 任务，线上已禁用 mock 生图" }, { status: 400 })
  }

  const entitlement = await getEntitlementForUser(userId)
  const subStatus = entitlement.subscription?.status ?? "inactive"
  if (subStatus === "inactive" || subStatus === "expired") {
    trackEvent("job.retry_blocked", { userId, jobId: id, reason: "subscription_inactive", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "需要订阅后才能创建任务" }, { status: 403 })
  }
  if (subStatus === "past_due") {
    trackEvent("job.retry_blocked", { userId, jobId: id, reason: "subscription_past_due", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "订阅扣款失败或已暂停，请先处理账单" }, { status: 403 })
  }
  if (entitlement.usage.quotaRemaining <= 0) {
    trackEvent("job.retry_blocked", { userId, jobId: id, reason: "quota_exhausted", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "本月额度已用完" }, { status: 403 })
  }

  const activeJobId = await getActiveJobIdForUser(userId)
  if (activeJobId) {
    trackEvent("job.retry_blocked", { userId, jobId: id, reason: "concurrency_limit", activeJobId })
    return NextResponse.json({ error: "你已有一个进行中的任务，请等待完成后再创建", activeJobId }, { status: 409 })
  }

  const now = new Date().toISOString()
  await updateJobRecord(id, (prev) => ({
    ...prev,
    userId: prev.userId ?? userId,
    status: "queued",
    error: null,
    outputImageUrls: [],
    attempt: prev.attempt + 1,
    updatedAt: now,
  }))

  trackEvent("job.retried", { userId, jobId: id })
  enqueueJob(id)
  return NextResponse.json({ jobId: id })
}
