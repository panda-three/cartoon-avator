"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { PayPalCheckout } from "@/components/paypal-checkout"
import { PricingClient } from "@/app/pricing/pricing-client"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { useI18n } from "@/components/i18n-provider"
import {
  PRICING_PLANS,
  getPlanPriceLabel,
  getPlanQuotaLabel,
  type BillingInterval,
  type BillingProvider,
} from "@/lib/pricing"
import { cn } from "@/lib/utils"
import { BillingCheckoutResponseSchema } from "@/lib/billing"

const PROVIDER_LABELS: Record<BillingProvider, "pricing.page.payment.paypal" | "pricing.page.payment.creem"> = {
  paypal: "pricing.page.payment.paypal",
  creem: "pricing.page.payment.creem",
}

function resolveProviders({
  paypalAvailable,
  configuredProviders,
}: {
  paypalAvailable: boolean
  configuredProviders: BillingProvider[]
}): BillingProvider[] {
  if (configuredProviders.length) {
    return configuredProviders.filter((provider) => (provider === "paypal" ? paypalAvailable : true))
  }
  return paypalAvailable ? ["paypal"] : ["creem"]
}

export function PricingPage() {
  const { t } = useI18n()
  const [interval, setInterval] = useState<BillingInterval>("monthly")
  const [refreshKey, setRefreshKey] = useState(0)
  const [provider, setProvider] = useState<BillingProvider>("paypal")
  const [creemLoading, setCreemLoading] = useState<string | null>(null)
  const [creemError, setCreemError] = useState<{ planId: string; message: string } | null>(null)

  const yearlyDiscount = process.env.NEXT_PUBLIC_PLAN_YEARLY_DISCOUNT
  const currency = (process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD").toUpperCase()
  const paypalAvailable = Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)
  const configuredProvidersRaw = process.env.NEXT_PUBLIC_BILLING_PROVIDERS ?? ""
  const providers = useMemo(() => {
    const configuredProviders = configuredProvidersRaw
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter((item): item is BillingProvider => item === "paypal" || item === "creem")
    return resolveProviders({ paypalAvailable, configuredProviders })
  }, [configuredProvidersRaw, paypalAvailable])
  const showProviderToggle = providers.length > 1

  const sharedFeatures = useMemo(
    () => [
      t("pricing.plan.feature1"),
      t("pricing.plan.feature2"),
      t("pricing.plan.feature3"),
      t("pricing.plan.feature4"),
    ],
    [t],
  )

  useEffect(() => {
    if (!providers.length) return
    if (!providers.includes(provider)) {
      setProvider(providers[0])
    }
  }, [provider, providers])

  const onCreemSubscribe = async (planId: string) => {
    setCreemLoading(planId)
    setCreemError(null)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
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

      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : t("pricing.client.error.checkoutFailed")
      setCreemError({ planId, message })
    } finally {
      setCreemLoading(null)
    }
  }

  return (
    <div className="pb-20">
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative text-center">
          <Badge variant="secondary" className="mb-4">
            {t("pricing.title")}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            {t("pricing.page.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("pricing.page.subtitle")}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-border bg-card/60 px-4 py-2">
              <span className={cn("text-sm", interval === "monthly" ? "text-foreground" : "text-muted-foreground")}>
                {t("pricing.page.toggle.monthly")}
              </span>
              <Switch checked={interval === "yearly"} onCheckedChange={(value) => setInterval(value ? "yearly" : "monthly")} />
              <span className={cn("text-sm", interval === "yearly" ? "text-foreground" : "text-muted-foreground")}>
                {t("pricing.page.toggle.yearly")}
              </span>
              <Badge variant="outline" className="bg-transparent">
                {yearlyDiscount ? t("pricing.page.toggle.save", { percent: yearlyDiscount }) : t("pricing.page.toggle.bestValue")}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">{t("pricing.page.currency", { currency })}</div>
          </div>

          {showProviderToggle ? (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t("pricing.page.payment.title")}
              </div>
              <ButtonGroup>
                {providers.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={provider === item ? "secondary" : "outline"}
                    className={cn("bg-transparent", provider === item && "text-foreground")}
                    onClick={() => setProvider(item)}
                  >
                    {t(PROVIDER_LABELS[item])}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          ) : null}
        </div>
      </section>

      <section id="plans" className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const priceLabel = getPlanPriceLabel(plan.id, interval)
            const quotaLabel = getPlanQuotaLabel(plan.id)
            const features = [
              quotaLabel ? t("pricing.plan.quota", { quota: quotaLabel }) : t("pricing.page.quotaFallback"),
              ...sharedFeatures,
            ]

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative h-full flex flex-col",
                  plan.highlight ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border/60",
                )}
              >
                {plan.badgeKey ? (
                  <Badge className="absolute right-4 top-4" variant="secondary">
                    {t(plan.badgeKey)}
                  </Badge>
                ) : null}
                <CardHeader>
                  <CardTitle className="text-2xl">{t(plan.nameKey)}</CardTitle>
                  <CardDescription>{t(plan.descriptionKey)}</CardDescription>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-bold text-foreground">
                        {priceLabel ?? t("pricing.page.priceContact")}
                      </div>
                      {priceLabel ? (
                        <div className="text-sm text-muted-foreground">
                          {interval === "yearly" ? t("pricing.page.perYear") : t("pricing.page.perMonth")}
                        </div>
                      ) : null}
                    </div>
                    {interval === "yearly" ? (
                      <div className="text-xs text-muted-foreground pt-1">{t("pricing.page.yearlyNote")}</div>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="border-t flex-col items-stretch">
                  {provider === "creem" ? (
                    <>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => onCreemSubscribe(plan.id)}
                        disabled={creemLoading === plan.id}
                      >
                        {creemLoading === plan.id ? <Spinner className="mr-2" /> : null}
                        {t("pricing.page.creemCta")}
                      </Button>
                      {creemError?.planId === plan.id ? (
                        <div className="text-xs text-destructive">{creemError.message}</div>
                      ) : null}
                    </>
                  ) : (
                    <PayPalCheckout
                      planId={plan.id}
                      interval={interval}
                      onSuccess={() => setRefreshKey((prev) => prev + 1)}
                    />
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="pt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <PricingClient refreshKey={refreshKey} billingProvider={provider} />
        </div>
      </section>

      <section className="pt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href="/create">{t("pricing.page.tryCreate")}</Link>
          </Button>
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href="/">{t("pricing.page.backHome")}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
