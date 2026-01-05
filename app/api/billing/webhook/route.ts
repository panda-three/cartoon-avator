import crypto from "node:crypto"
import { NextResponse } from "next/server"
import { upsertSubscriptionForUser, type SubscriptionStatus } from "@/lib/server/billing-store"

export const runtime = "nodejs"

function normalizeSignature(value: string): string {
  const trimmed = value.trim()
  if (trimmed.startsWith("sha256=")) return trimmed.slice("sha256=".length)
  return trimmed
}

function timingSafeEqualHex(a: string, b: string) {
  const bufA = Buffer.from(a, "hex")
  const bufB = Buffer.from(b, "hex")
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function verifyWebhookSignature({
  secret,
  body,
  signature,
}: {
  secret: string
  body: string
  signature: string | null
}) {
  if (!signature) throw new Error("缺少签名")
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
  const provided = normalizeSignature(signature)
  if (!timingSafeEqualHex(expected, provided)) throw new Error("签名校验失败")
}

function readHeader(req: Request, names: string[]): string | null {
  for (const name of names) {
    const value = req.headers.get(name)
    if (value) return value
  }
  return null
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toIsoDate(value: unknown): string | null {
  const asNum = asNumber(value)
  if (asNum !== null) {
    const ms = asNum > 10_000_000_000 ? asNum : asNum * 1000
    return new Date(ms).toISOString()
  }

  const str = asString(value)
  if (!str) return null
  const ms = Date.parse(str)
  if (!Number.isFinite(ms)) return null
  return new Date(ms).toISOString()
}

function normalizeStatus(type: string | null, rawStatus: string | null): SubscriptionStatus {
  const status = (rawStatus ?? type ?? "").toLowerCase()

  if (status.includes("past_due") || status.includes("payment_failed") || status.includes("unpaid")) return "past_due"
  if (status.includes("cancel")) return "canceled"
  if (status.includes("expire")) return "expired"
  if (status.includes("active") || status.includes("trial") || status.includes("paid")) return "active"

  return "inactive"
}

function extractUserId(payload: any): string | null {
  return (
    asString(payload?.data?.metadata?.userId) ??
    asString(payload?.data?.metadata?.user_id) ??
    asString(payload?.data?.checkout?.metadata?.userId) ??
    asString(payload?.data?.checkout?.metadata?.user_id) ??
    asString(payload?.data?.subscription?.metadata?.userId) ??
    asString(payload?.data?.subscription?.metadata?.user_id) ??
    asString(payload?.data?.order?.metadata?.userId) ??
    asString(payload?.data?.order?.metadata?.user_id) ??
    asString(payload?.data?.customer?.metadata?.userId) ??
    asString(payload?.data?.customer?.metadata?.user_id) ??
    asString(payload?.data?.userId) ??
    asString(payload?.data?.user_id) ??
    asString(payload?.data?.client_reference_id) ??
    asString(payload?.data?.clientReferenceId) ??
    asString(payload?.metadata?.userId) ??
    asString(payload?.metadata?.user_id) ??
    null
  )
}

export async function POST(req: Request) {
  const rawBody = await req.text()

  const secret = process.env.CREEM_WEBHOOK_SECRET
  if (secret) {
    const signature = readHeader(req, ["creem-signature", "x-creem-signature", "x-webhook-signature"])
    try {
      verifyWebhookSignature({ secret, body: rawBody, signature })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "签名校验失败" }, { status: 401 })
    }
  }

  const payload = JSON.parse(rawBody || "{}")
  const userId = extractUserId(payload)
  if (!userId) {
    return NextResponse.json({ error: "缺少 userId（metadata.userId / client_reference_id）" }, { status: 400 })
  }

  const eventType = asString(payload?.type) ?? asString(payload?.event) ?? null
  const statusRaw =
    asString(payload?.data?.status) ??
    asString(payload?.data?.subscription?.status) ??
    asString(payload?.data?.invoice?.status) ??
    null

  const status = normalizeStatus(eventType, statusRaw)
  const currentPeriodEnd =
    toIsoDate(payload?.data?.current_period_end) ??
    toIsoDate(payload?.data?.currentPeriodEnd) ??
    toIsoDate(payload?.data?.subscription?.current_period_end) ??
    toIsoDate(payload?.data?.subscription?.currentPeriodEnd) ??
    null

  const planId =
    asString(payload?.data?.metadata?.planId) ??
    asString(payload?.data?.metadata?.plan_id) ??
    asString(payload?.data?.checkout?.metadata?.planId) ??
    asString(payload?.data?.checkout?.metadata?.plan_id) ??
    asString(payload?.data?.subscription?.metadata?.planId) ??
    asString(payload?.data?.subscription?.metadata?.plan_id) ??
    asString(payload?.data?.order?.metadata?.planId) ??
    asString(payload?.data?.order?.metadata?.plan_id) ??
    asString(payload?.data?.plan_id) ??
    asString(payload?.data?.planId) ??
    asString(payload?.data?.product_id) ??
    asString(payload?.data?.productId) ??
    asString(payload?.data?.product?.id) ??
    asString(payload?.data?.checkout?.product_id) ??
    asString(payload?.data?.checkout?.productId) ??
    asString(payload?.data?.checkout?.product?.id) ??
    asString(payload?.data?.subscription?.plan_id) ??
    asString(payload?.data?.subscription?.planId) ??
    asString(payload?.data?.subscription?.product_id) ??
    asString(payload?.data?.subscription?.productId) ??
    asString(payload?.data?.subscription?.product?.id) ??
    null

  const creemCustomerId =
    asString(payload?.data?.customer_id) ??
    asString(payload?.data?.customerId) ??
    asString(payload?.data?.customer?.id) ??
    null

  const creemSubscriptionId =
    asString(payload?.data?.subscription_id) ??
    asString(payload?.data?.subscriptionId) ??
    asString(payload?.data?.subscription?.id) ??
    null

  await upsertSubscriptionForUser(userId, {
    provider: "creem",
    status,
    planId,
    currentPeriodEnd,
    creemCustomerId,
    creemSubscriptionId,
  })

  return NextResponse.json({ ok: true })
}
