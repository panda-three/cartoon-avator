import { NextResponse } from "next/server"
import { z } from "zod"
import { getUserId } from "@/lib/server/auth"
import { createPayPalOrder } from "@/lib/server/paypal"
import { trackEvent } from "@/lib/server/telemetry"
import { BILLING_INTERVALS, DEFAULT_PLAN_ID, type BillingInterval } from "@/lib/pricing"

export const runtime = "nodejs"

const BodySchema = z
  .object({
    planId: z.string().optional(),
    interval: z.enum(BILLING_INTERVALS).optional(),
  })
  .optional()

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "缺少用户身份" }, { status: 401 })

  const body = BodySchema.parse(await req.json().catch(() => undefined))
  const planId = body?.planId ?? process.env.DEFAULT_PLAN_ID ?? DEFAULT_PLAN_ID
  const interval = (body?.interval ?? "monthly") as BillingInterval

  try {
    const order = await createPayPalOrder({ userId, planId, interval })
    trackEvent("billing.paypal.order_created", { userId, planId, interval, orderId: order.id })
    return NextResponse.json({ id: order.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "创建 PayPal 订单失败"
    trackEvent("billing.paypal.order_failed", { userId, planId, interval, errorMessage: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
