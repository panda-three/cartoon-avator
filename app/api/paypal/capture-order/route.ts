import { NextResponse } from "next/server"
import { z } from "zod"
import { getUserId } from "@/lib/server/auth"
import { upsertSubscriptionForUser } from "@/lib/server/billing-store"
import { capturePayPalOrder } from "@/lib/server/paypal"
import { trackEvent } from "@/lib/server/telemetry"
import { BILLING_INTERVALS, DEFAULT_PLAN_ID, type BillingInterval } from "@/lib/pricing"

export const runtime = "nodejs"

const BodySchema = z.object({
  orderId: z.string().min(1),
  planId: z.string().optional(),
  interval: z.enum(BILLING_INTERVALS).optional(),
})

function computePeriodEnd(interval: BillingInterval) {
  const end = new Date()
  if (interval === "yearly") {
    end.setFullYear(end.getFullYear() + 1)
  } else {
    end.setMonth(end.getMonth() + 1)
  }
  return end.toISOString()
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "缺少用户身份" }, { status: 401 })

  const body = BodySchema.parse(await req.json().catch(() => undefined))
  const planId = body.planId ?? process.env.DEFAULT_PLAN_ID ?? DEFAULT_PLAN_ID
  const interval = (body.interval ?? "monthly") as BillingInterval

  try {
    const capture = await capturePayPalOrder(body.orderId)
    if (capture.status && capture.status !== "COMPLETED") {
      throw new Error(`PayPal 订单状态异常：${capture.status}`)
    }

    const currentPeriodEnd = computePeriodEnd(interval)
    await upsertSubscriptionForUser(userId, {
      provider: "paypal",
      status: "active",
      planId,
      currentPeriodEnd,
    })

    trackEvent("billing.paypal.capture_succeeded", {
      userId,
      planId,
      interval,
      orderId: body.orderId,
      currentPeriodEnd,
    })

    return NextResponse.json({ subscriptionStatus: "active", currentPeriodEnd })
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal 捕获失败"
    trackEvent("billing.paypal.capture_failed", {
      userId,
      planId,
      interval,
      orderId: body.orderId,
      errorMessage: message,
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
