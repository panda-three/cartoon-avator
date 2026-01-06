"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"

export function Pricing() {
  const { t } = useI18n()

  const planFeatures = [
    t("pricing.plan.feature1"),
    t("pricing.plan.feature2"),
    t("pricing.plan.feature3"),
    t("pricing.plan.feature4"),
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            {t("pricing.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>{t("pricing.plan.title")}</CardTitle>
              <CardDescription>{t("pricing.plan.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="border-t">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/pricing">{t("pricing.plan.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("pricing.more.title")}</CardTitle>
              <CardDescription>{t("pricing.more.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("pricing.more.body")}
              </p>
            </CardContent>
            <CardFooter className="border-t">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/create">{t("pricing.more.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
