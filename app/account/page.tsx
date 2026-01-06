"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { AccountClient } from "@/app/account/account-client"
import { useI18n } from "@/components/i18n-provider"

export default function AccountPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">{t("account.title")}</h1>
            <p className="text-muted-foreground">{t("account.subtitle")}</p>
          </div>

          <AccountClient />

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/pricing">{t("account.cta.pricing")}</Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/">{t("account.cta.backHome")}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
