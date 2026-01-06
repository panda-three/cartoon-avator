"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Pricing } from "@/components/pricing"
import { Button } from "@/components/ui/button"
import { PricingClient } from "@/app/pricing/pricing-client"
import { useI18n } from "@/components/i18n-provider"

export default function PricingPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Pricing />
        <PricingClient />
        <div className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/create">{t("pricing.page.tryCreate")}</Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/">{t("pricing.page.backHome")}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
