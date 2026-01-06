"use client"

import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CreateForm } from "@/app/create/create-form"
import { useI18n } from "@/components/i18n-provider"

export default function CreatePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">
            {t("create.page.title")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("create.page.subtitle")}
          </p>
          <Suspense fallback={<div className="text-sm text-muted-foreground">{t("common.loading")}</div>}>
            <CreateForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
