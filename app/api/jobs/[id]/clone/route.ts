import { NextResponse } from "next/server"
import { z } from "zod"
import { getStylePackById } from "@/lib/style-packs"
import { cloneJobFromSource, getActiveJobIdForUser, getJobRecord } from "@/lib/server/job-store"
import { enqueueJob } from "@/lib/server/job-runner"
import { getOpenRouterApiKey } from "@/lib/server/openrouter"
import { getUserId } from "@/lib/server/auth"
import { getEntitlementForUser } from "@/lib/server/billing-store"
import type { JobProvider } from "@/lib/jobs"
import { trackEvent } from "@/lib/server/telemetry"

export const runtime = "nodejs"

function pickProvider(): JobProvider {
  if (process.env.OPENROUTER_MOCK === "1") return "mock"
  return getOpenRouterApiKey() ? "openrouter" : "mock"
}

const BodySchema = z
  .object({
    stylePackId: z.string().optional(),
    identityStrength: z.number().int().min(0).max(100).optional(),
  })
  .optional()

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "缺少用户身份，请刷新页面后重试" }, { status: 401 })
  }

  const entitlement = await getEntitlementForUser(userId)
  const subStatus = entitlement.subscription?.status ?? "inactive"
  if (subStatus === "inactive" || subStatus === "expired") {
    trackEvent("job.clone_blocked", { userId, reason: "subscription_inactive", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "需要订阅后才能创建任务" }, { status: 403 })
  }
  if (subStatus === "past_due") {
    trackEvent("job.clone_blocked", { userId, reason: "subscription_past_due", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "订阅扣款失败或已暂停，请先处理账单" }, { status: 403 })
  }
  if (entitlement.usage.quotaRemaining <= 0) {
    trackEvent("job.clone_blocked", { userId, reason: "quota_exhausted", subscriptionStatus: subStatus })
    return NextResponse.json({ error: "本月额度已用完" }, { status: 403 })
  }

  const activeJobId = await getActiveJobIdForUser(userId)
  if (activeJobId) {
    trackEvent("job.clone_blocked", { userId, reason: "concurrency_limit", activeJobId })
    return NextResponse.json({ error: "你已有一个进行中的任务，请等待完成后再创建", activeJobId }, { status: 409 })
  }

  const source = await getJobRecord(id)
  if (!source) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }
  if (source.userId !== userId) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }

  const body = BodySchema.parse(await req.json().catch(() => undefined))
  const stylePackId = body?.stylePackId ?? source.stylePackId
  const identityStrength = body?.identityStrength ?? source.params.identityStrength

  const pack = getStylePackById(stylePackId)
  if (!pack?.isActive) {
    return NextResponse.json({ error: "风格包不可用" }, { status: 400 })
  }

  const provider = pickProvider()
  const job = await cloneJobFromSource({
    sourceJobId: source.id,
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
    source: "clone_endpoint",
    sourceJobId: source.id,
  })
  enqueueJob(job.id)
  return NextResponse.json({ jobId: job.id }, { status: 201 })
}
