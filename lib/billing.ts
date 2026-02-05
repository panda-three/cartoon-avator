import { z } from "zod"

export const SubscriptionStatusSchema = z.enum(["inactive", "active", "canceled", "past_due", "expired"])
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>

export const SubscriptionProviderSchema = z.enum(["creem", "mock", "paypal"])
export type SubscriptionProvider = z.infer<typeof SubscriptionProviderSchema>

export const BillingSubscriptionSchema = z
  .object({
    provider: SubscriptionProviderSchema,
    status: SubscriptionStatusSchema,
    currentPeriodEnd: z.string().nullable(),
    planId: z.string().nullable(),
  })
  .nullable()
export type BillingSubscription = z.infer<typeof BillingSubscriptionSchema>

export const BillingUsageSchema = z.object({
  month: z.string(),
  quotaTotal: z.number().int().nonnegative(),
  quotaUsed: z.number().int().nonnegative(),
  quotaRemaining: z.number().int().nonnegative(),
})
export type BillingUsage = z.infer<typeof BillingUsageSchema>

export const BillingStatusResponseSchema = z.object({
  subscription: BillingSubscriptionSchema,
  usage: BillingUsageSchema,
  canCreateJob: z.boolean(),
  createBlockedReason: z.string().nullable(),
  activeJobId: z.string().nullable(),
})
export type BillingStatusResponse = z.infer<typeof BillingStatusResponseSchema>

export const BillingCheckoutResponseSchema = z.object({
  checkoutUrl: z.string().url().nullable(),
  subscriptionStatus: SubscriptionStatusSchema.optional(),
})
export type BillingCheckoutResponse = z.infer<typeof BillingCheckoutResponseSchema>

export const BillingPortalResponseSchema = z.object({
  portalUrl: z.string().url().nullable(),
})
export type BillingPortalResponse = z.infer<typeof BillingPortalResponseSchema>
