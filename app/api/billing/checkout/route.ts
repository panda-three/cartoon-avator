import crypto from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getUserId } from "@/lib/server/auth"
import { upsertSubscriptionForUser } from "@/lib/server/billing-store"

export const runtime = "nodejs"

const BodySchema = z
  .object({
    planId: z.string().optional(),
  })
  .optional()

const CreemCheckoutResponseSchema = z.object({
  checkout_url: z.string().url(),
})

function shouldUseMockCheckout() {
  if (process.env.CREEM_MOCK === "1") return true
  return !process.env.CREEM_API_KEY && !process.env.CREEM_CHECKOUT_URL
}

function looksLikeCreemProductId(value: string) {
  return /^prod_[a-zA-Z0-9]+$/.test(value)
}

function creemErrorHint(status: number) {
  if (status === 401) return "（API key 缺失或无效）"
  if (status === 403) return "（API key 无权限/已失效/环境不匹配）"
  if (status === 404) return "（product_id 不存在或不属于该账号）"
  return ""
}

function getCreemApiBaseUrl(apiKey: string): string {
  const override = process.env.CREEM_API_BASE_URL
  if (override) return override.replace(/\/+$/, "")

  // Creem OpenAPI exposes both https://api.creem.io and https://test-api.creem.io
  // Test keys must use the test host.
  if (apiKey.startsWith("creem_test_")) return "https://test-api.creem.io"
  return "https://api.creem.io"
}

async function createCreemCheckoutUrl({
  userId,
  productId,
  planId,
}: {
  userId: string
  productId: string
  planId: string
}): Promise<string> {
  const apiKey = process.env.CREEM_API_KEY
  if (!apiKey) throw new Error("缺少 CREEM_API_KEY")
  const baseUrl = getCreemApiBaseUrl(apiKey)

  const payload = {
    request_id: crypto.randomUUID(),
    product_id: productId,
    units: 1,
    ...(process.env.CREEM_RETURN_URL ? { success_url: process.env.CREEM_RETURN_URL } : {}),
    metadata: { userId, planId, productId },
  }

  const res = await fetch(`${baseUrl}/v1/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  })

  const raw = await res.text()
  let json: any = null
  if (raw) {
    try {
      json = JSON.parse(raw)
    } catch {
      json = null
    }
  }
  if (!res.ok) {
    const detail =
      (typeof json?.error === "string" && json.error) ||
      (typeof json?.message === "string" && json.message) ||
      (typeof raw === "string" && raw.trim() ? raw.trim() : null)

    throw new Error(`Creem 返回 ${res.status} ${res.statusText}${creemErrorHint(res.status)}${detail ? `：${detail}` : ""}`)
  }

  const parsed = CreemCheckoutResponseSchema.parse(json)
  return parsed.checkout_url
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "缺少用户身份" }, { status: 401 })

  const body = BodySchema.parse(await req.json().catch(() => undefined))
  const planId = body?.planId ?? process.env.DEFAULT_PLAN_ID ?? "monthly"
  const productId = process.env.CREEM_PRODUCT_ID ?? planId

  if (shouldUseMockCheckout()) {
    const end = new Date()
    end.setMonth(end.getMonth() + 1)

    await upsertSubscriptionForUser(userId, {
      provider: "mock",
      status: "active",
      planId,
      currentPeriodEnd: end.toISOString(),
    })

    return NextResponse.json({ checkoutUrl: null, subscriptionStatus: "active" })
  }

  if (process.env.CREEM_API_KEY) {
    if (!looksLikeCreemProductId(productId)) {
      return NextResponse.json(
        {
          error:
            "缺少有效的 Creem Product ID。请设置 `CREEM_PRODUCT_ID=prod_...`（非密钥），或把 `DEFAULT_PLAN_ID`/前端 planId 直接改成 `prod_...`。",
        },
        { status: 500 },
      )
    }
    try {
      const checkoutUrl = await createCreemCheckoutUrl({ userId, productId, planId })
      return NextResponse.json({ checkoutUrl })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "创建订阅失败" }, { status: 500 })
    }
  }

  const checkoutUrl = process.env.CREEM_CHECKOUT_URL
  if (!checkoutUrl) return NextResponse.json({ error: "缺少 CREEM_API_KEY 或 CREEM_CHECKOUT_URL" }, { status: 500 })

  const url = new URL(checkoutUrl)
  url.searchParams.set("client_reference_id", userId)
  url.searchParams.set("plan_id", planId)
  if (process.env.CREEM_RETURN_URL) {
    url.searchParams.set("return_url", process.env.CREEM_RETURN_URL)
  }

  return NextResponse.json({ checkoutUrl: url.toString() })
}
