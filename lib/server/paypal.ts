import "server-only"

import { z } from "zod"
import type { BillingInterval } from "@/lib/pricing"

const TokenResponseSchema = z.object({
  access_token: z.string(),
})

const OrderResponseSchema = z.object({
  id: z.string(),
})

const CaptureResponseSchema = z.object({
  status: z.string().optional(),
})

function resolvePayPalEnv(): "sandbox" | "live" {
  const raw = process.env.PAYPAL_ENV?.toLowerCase()
  if (raw === "live" || raw === "production") return "live"
  return "sandbox"
}

export function getPayPalBaseUrl(): string {
  return resolvePayPalEnv() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
}

export function getPayPalCurrency(): string {
  const currency = process.env.PAYPAL_CURRENCY ?? process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD"
  return currency.toUpperCase()
}

function parsePrice(raw?: string | null): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/[^0-9.]/g, "")
  if (!cleaned) return null
  const parsed = Number.parseFloat(cleaned)
  if (!Number.isFinite(parsed)) return null
  return parsed.toFixed(2)
}

function buildPlanPriceKey(planId: string, interval: BillingInterval, prefix: string) {
  const planKey = planId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
  const intervalKey = interval === "yearly" ? "YEARLY" : "MONTHLY"
  return `${prefix}_PLAN_${planKey}_${intervalKey}_PRICE`
}

export function resolvePayPalAmount(planId: string, interval: BillingInterval): string {
  const planKey = buildPlanPriceKey(planId, interval, "PAYPAL")
  const publicKey = buildPlanPriceKey(planId, interval, "NEXT_PUBLIC")
  const legacyKey = interval === "yearly" ? "PAYPAL_PLAN_YEARLY_PRICE" : "PAYPAL_PLAN_MONTHLY_PRICE"
  const legacyPublicKey = interval === "yearly" ? "NEXT_PUBLIC_PLAN_YEARLY_PRICE" : "NEXT_PUBLIC_PLAN_MONTHLY_PRICE"
  const raw = process.env[planKey] ?? process.env[publicKey] ?? process.env[legacyKey] ?? process.env[legacyPublicKey]
  const parsed = parsePrice(raw)
  if (!parsed) {
    throw new Error(`缺少 PayPal 价格配置：请设置 ${planKey} 或 ${publicKey}`)
  }
  return parsed
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET
  if (!clientId || !secret) {
    throw new Error("缺少 PayPal API 凭证")
  }
  return { clientId, secret }
}

async function getAccessToken(): Promise<string> {
  const { clientId, secret } = getPayPalCredentials()
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64")
  const res = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const detail = typeof json?.error_description === "string" ? json.error_description : res.statusText
    throw new Error(`PayPal 授权失败：${detail}`)
  }

  const parsed = TokenResponseSchema.parse(json)
  return parsed.access_token
}

export async function createPayPalOrder({
  userId,
  planId,
  interval,
}: {
  userId: string
  planId: string
  interval: BillingInterval
}): Promise<{ id: string; amount: string; currency: string }> {
  const amount = resolvePayPalAmount(planId, interval)
  const currency = getPayPalCurrency()
  const token = await getAccessToken()

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount,
        },
        custom_id: `${userId}:${planId}:${interval}`,
        description: `Cartoon Avatar ${planId} ${interval} plan`,
      },
    ],
    application_context: {
      brand_name: process.env.NEXT_PUBLIC_APP_NAME ?? "Cartoon Avatar",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
    },
  }

  const res = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const detail = typeof json?.message === "string" ? json.message : res.statusText
    throw new Error(`创建 PayPal 订单失败：${detail}`)
  }

  const parsed = OrderResponseSchema.parse(json)
  return { id: parsed.id, amount, currency }
}

export async function capturePayPalOrder(orderId: string): Promise<{ status: string | null }> {
  const token = await getAccessToken()
  const res = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const detail = typeof json?.message === "string" ? json.message : res.statusText
    throw new Error(`PayPal 捕获失败：${detail}`)
  }

  const parsed = CaptureResponseSchema.parse(json)
  return { status: parsed.status ?? null }
}
