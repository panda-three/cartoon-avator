import { NextResponse } from "next/server"
import { getUserId } from "@/lib/server/auth"
import { getSubscriptionForUser } from "@/lib/server/billing-store"

export const runtime = "nodejs"

function interpolateTemplate(template: string, vars: Record<string, string | null | undefined>) {
  let out = template
  for (const [key, value] of Object.entries(vars)) {
    if (!value) continue
    out = out.replaceAll(`{${key}}`, value).replaceAll(`{{${key}}}`, value)
  }
  return out
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: "缺少用户身份" }, { status: 401 })

  const sub = await getSubscriptionForUser(userId)
  if (!sub || sub.provider !== "creem") {
    return NextResponse.json({ portalUrl: null })
  }

  const template = process.env.CREEM_CUSTOMER_PORTAL_URL?.trim()
  if (!template) {
    return NextResponse.json({ portalUrl: null })
  }

  const resolved = interpolateTemplate(template, {
    userId,
    customerId: sub.creemCustomerId,
    subscriptionId: sub.creemSubscriptionId,
  })

  try {
    const url = new URL(resolved)
    return NextResponse.json({ portalUrl: url.toString() })
  } catch {
    return NextResponse.json({ error: "CREEM_CUSTOMER_PORTAL_URL 不是合法 URL，请检查配置" }, { status: 500 })
  }
}

