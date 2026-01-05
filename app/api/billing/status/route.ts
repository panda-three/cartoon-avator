import { NextResponse } from "next/server"
import { getUserId } from "@/lib/server/auth"
import { getEntitlementForUser } from "@/lib/server/billing-store"
import { getActiveJobIdForUser } from "@/lib/server/job-store"

export const runtime = "nodejs"

function buildCreateBlockedReason({
  subscriptionStatus,
  quotaRemaining,
  activeJobId,
}: {
  subscriptionStatus: string
  quotaRemaining: number
  activeJobId: string | null
}): string | null {
  if (subscriptionStatus === "inactive" || subscriptionStatus === "expired") return "需要订阅后才能创建任务"
  if (subscriptionStatus === "past_due") return "订阅扣款失败或已暂停，请先处理账单"
  if (quotaRemaining <= 0) return "本月额度已用完"
  if (activeJobId) return "你已有一个进行中的任务，请等待完成后再创建"
  return null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json(
      {
        subscription: null,
        usage: { month: "1970-01", quotaTotal: 0, quotaUsed: 0, quotaRemaining: 0 },
        canCreateJob: false,
        createBlockedReason: "缺少用户身份",
        activeJobId: null,
      },
      { status: 401 },
    )
  }

  const entitlement = await getEntitlementForUser(userId)
  const subStatus = entitlement.subscription?.status ?? "inactive"
  const quotaRemaining = entitlement.usage.quotaRemaining
  const activeJobId = await getActiveJobIdForUser(userId)
  const reason = buildCreateBlockedReason({ subscriptionStatus: subStatus, quotaRemaining, activeJobId })

  return NextResponse.json({
    subscription: entitlement.subscription,
    usage: entitlement.usage,
    canCreateJob: reason === null,
    createBlockedReason: reason,
    activeJobId,
  })
}
