"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { JobClient } from "@/app/jobs/[id]/job-client"
import { useI18n } from "@/components/i18n-provider"

export default function JobPage() {
  const { t } = useI18n()
  const params = useParams()

  const idValue = params?.id
  const id = typeof idValue === "string" ? idValue : Array.isArray(idValue) ? idValue[0] : null

  if (!id) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">{t("job.page.title")}</h1>
            <p className="text-muted-foreground">{t("job.page.subtitle", { id })}</p>
          </div>

          <JobClient jobId={id} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
