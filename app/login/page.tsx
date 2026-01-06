"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"

export default function LoginPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">{t("login.title")}</h1>
            <p className="text-muted-foreground">{t("login.subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("login.card.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t("login.card.body")}</CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/create">{t("login.cta.continue")}</Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/">{t("login.cta.backHome")}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
