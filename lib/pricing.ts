import type { MessageKey } from "@/lib/i18n/messages"

export const BILLING_INTERVALS = ["monthly", "yearly"] as const
export type BillingInterval = (typeof BILLING_INTERVALS)[number]

export const BILLING_PROVIDERS = ["paypal", "creem"] as const
export type BillingProvider = (typeof BILLING_PROVIDERS)[number]

export const DEFAULT_PLAN_ID = "monthly"

export type PricingPlan = {
  id: string
  nameKey: MessageKey
  descriptionKey: MessageKey
  highlight?: boolean
  badgeKey?: MessageKey
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    nameKey: "pricing.plans.basic.title",
    descriptionKey: "pricing.plans.basic.subtitle",
  },
  {
    id: "pro",
    nameKey: "pricing.plans.pro.title",
    descriptionKey: "pricing.plans.pro.subtitle",
    highlight: true,
    badgeKey: "pricing.plans.popular",
  },
  {
    id: "max",
    nameKey: "pricing.plans.max.title",
    descriptionKey: "pricing.plans.max.subtitle",
  },
]

function normalizePublicValue(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const PLAN_PRICE_MAP: Record<string, Record<BillingInterval, string | null>> = {
  basic: {
    monthly: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_BASIC_MONTHLY_PRICE),
    yearly: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_BASIC_YEARLY_PRICE),
  },
  pro: {
    monthly: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_PRO_MONTHLY_PRICE),
    yearly: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_PRO_YEARLY_PRICE),
  },
  max: {
    monthly: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_MAX_MONTHLY_PRICE),
    yearly: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_MAX_YEARLY_PRICE),
  },
}

const PLAN_QUOTA_MAP: Record<string, string | null> = {
  basic: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_BASIC_QUOTA),
  pro: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_PRO_QUOTA),
  max: normalizePublicValue(process.env.NEXT_PUBLIC_PLAN_MAX_QUOTA),
}

function buildPublicPriceKey(planId: string, interval: BillingInterval) {
  const planKey = planId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
  const intervalKey = interval === "yearly" ? "YEARLY" : "MONTHLY"
  return `NEXT_PUBLIC_PLAN_${planKey}_${intervalKey}_PRICE`
}

function buildPublicQuotaKey(planId: string) {
  const planKey = planId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")
  return `NEXT_PUBLIC_PLAN_${planKey}_QUOTA`
}

export function getPlanPriceLabel(planId: string, interval: BillingInterval): string | null {
  const mapped = PLAN_PRICE_MAP[planId]?.[interval]
  if (mapped) return mapped
  const key = buildPublicPriceKey(planId, interval)
  const legacyKey = interval === "yearly" ? "NEXT_PUBLIC_PLAN_YEARLY_PRICE" : "NEXT_PUBLIC_PLAN_MONTHLY_PRICE"
  return normalizePublicValue(process.env[key] ?? process.env[legacyKey])
}

export function getPlanQuotaLabel(planId: string): string | null {
  const mapped = PLAN_QUOTA_MAP[planId]
  if (mapped) return mapped
  const key = buildPublicQuotaKey(planId)
  return normalizePublicValue(process.env[key] ?? process.env.NEXT_PUBLIC_PLAN_MONTHLY_QUOTA)
}
