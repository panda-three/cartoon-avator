"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">{t("notFound.title")}</h1>
            <p className="text-muted-foreground">{t("notFound.subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("notFound.suggestions")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <div>{t("notFound.suggestion1")}</div>
              <div>{t("notFound.suggestion2")}</div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/">{t("common.backHome")}</Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/create">{t("common.goCreate")}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
