"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useI18n()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">{t("error.title")}</h1>
            <p className="text-muted-foreground">{t("error.subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("error.details")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground break-words">{error.message || t("error.unknown")}</CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={reset}>
              {t("error.retry")}
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/">{t("common.backHome")}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
