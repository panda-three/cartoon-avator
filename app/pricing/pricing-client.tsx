"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useI18n } from "@/components/i18n-provider"
import { localeToDateLocale } from "@/lib/i18n/locale"
import type { BillingProvider } from "@/lib/pricing"
import {
  BillingCheckoutResponseSchema,
  BillingStatusResponseSchema,
  type BillingStatusResponse,
  type SubscriptionStatus,
} from "@/lib/billing"

function subscriptionLabel(status: SubscriptionStatus, t: (key: any) => string) {
  switch (status) {
    case "active":
      return t("billing.subscription.active")
    case "canceled":
      return t("billing.subscription.canceled")
    case "past_due":
      return t("billing.subscription.past_due")
    case "expired":
      return t("billing.subscription.expired")
    case "inactive":
      return t("billing.subscription.inactive")
    default:
      return t("billing.subscription.inactive")
  }
}

async function fetchStatus(opts: { fallbackErrorMessage: string }): Promise<BillingStatusResponse> {
  const res = await fetch("/api/billing/status", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : opts.fallbackErrorMessage
    throw new Error(message)
  }
  return BillingStatusResponseSchema.parse(json)
}

export function PricingClient({ refreshKey, billingProvider }: { refreshKey?: number; billingProvider?: BillingProvider }) {
  const { locale, t } = useI18n()
  const [status, setStatus] = useState<BillingStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const paypalConfigured = Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)
  const activeProvider = billingProvider ?? (paypalConfigured ? "paypal" : "creem")

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const next = await fetchStatus({ fallbackErrorMessage: t("pricing.client.error.fetchFailed") })
        if (cancelled) return
        setStatus(next)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : t("pricing.client.error.fetchFailed"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [refreshKey, t])

  const onSubscribe = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "monthly" }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const message = typeof json?.error === "string" ? json.error : t("pricing.client.error.checkoutFailed")
        throw new Error(message)
      }

      const parsed = BillingCheckoutResponseSchema.parse(json)
      if (parsed.checkoutUrl) {
        window.location.href = parsed.checkoutUrl
        return
      }

      const next = await fetchStatus({ fallbackErrorMessage: t("pricing.client.error.fetchFailed") })
      setStatus(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pricing.client.error.checkoutFailed"))
    } finally {
      setActionLoading(false)
    }
  }

  const subscriptionStatus = status?.subscription?.status ?? "inactive"
  const quota = status?.usage

  const isSubscribed = subscriptionStatus === "active" || subscriptionStatus === "canceled"
  const usePayPal = activeProvider === "paypal" && paypalConfigured
  const showSubscribe =
    !usePayPal && (subscriptionStatus === "inactive" || subscriptionStatus === "expired" || subscriptionStatus === "past_due")
  const dateLocale = localeToDateLocale(locale)

  return (
    <div className="pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("pricing.client.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>{t("pricing.client.loading")}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  {t("pricing.client.status", { status: subscriptionLabel(subscriptionStatus, t) })}
                </div>
                {status?.subscription?.currentPeriodEnd ? (
                  <div>
                    {t("pricing.client.periodEnd", {
                      time: new Date(status.subscription.currentPeriodEnd).toLocaleString(dateLocale),
                    })}
                  </div>
                ) : null}
                {quota ? (
                  <div>
                    {t("pricing.client.quota", {
                      used: quota.quotaUsed,
                      total: quota.quotaTotal,
                      remaining: quota.quotaRemaining,
                    })}
                  </div>
                ) : null}
                {status?.activeJobId ? (
                  <div>
                    {t("pricing.client.activeJobLabel")}{" "}
                    <Link href={`/jobs/${status.activeJobId}`}>{status.activeJobId}</Link>
                  </div>
                ) : null}
              </div>
            )}

            {error ? <div className="text-destructive">{error}</div> : null}

            {usePayPal && !isSubscribed ? (
              <div className="text-sm text-muted-foreground">{t("pricing.client.paypalHint")}</div>
            ) : null}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {showSubscribe ? (
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={onSubscribe}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Spinner className="mr-2" /> : null}
                  {t("pricing.client.subscribe")}
                </Button>
              ) : isSubscribed ? (
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
                  {t("pricing.client.subscribed")}
                </Button>
              ) : usePayPal ? (
                <Button variant="outline" className="bg-transparent" asChild>
                  <a href="#plans">{t("pricing.client.choosePlan")}</a>
                </Button>
              ) : null}

              <Button variant="outline" className="bg-transparent" asChild>
                <Link href="/create">{t("pricing.client.toCreate")}</Link>
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
