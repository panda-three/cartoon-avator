import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMessage, getMessages, type MessageKey, type MessageVars } from "@/lib/i18n/messages"
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/locale"
import {
  getActiveStylePacks,
  getStylePackById,
  getStylePackDescription,
  getStylePackName,
} from "@/lib/style-packs"

type StylePageProps = {
  params: {
    id: string
  }
}

export function generateStaticParams() {
  return getActiveStylePacks().map((pack) => ({ id: pack.id }))
}

export async function generateMetadata({ params }: StylePageProps): Promise<Metadata> {
  const cookieStore = await cookies()
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const messages = getMessages(locale)
  const pack = getStylePackById(params.id)

  if (!pack || !pack.isActive) {
    return {
      title: messages["notFound.title"],
      description: messages["notFound.subtitle"],
    }
  }

  const name = getStylePackName(pack, locale)
  const description = getStylePackDescription(pack, locale)
  const canonical = `https://www.zltest.online/styles/${pack.id}`

  return {
    title: `${name} | ${messages["app.name"]}`,
    description,
    alternates: {
      canonical,
    },
  }
}

export default async function StylePackPage({ params }: StylePageProps) {
  const cookieStore = await cookies()
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const messages = getMessages(locale)
  const pack = getStylePackById(params.id)

  if (!pack || !pack.isActive) {
    notFound()
  }

  const t = (key: MessageKey, vars?: MessageVars) => formatMessage(messages[key], vars)
  const name = getStylePackName(pack, locale)
  const description = getStylePackDescription(pack, locale)
  const steps = [
    t("stylePage.step1"),
    t("stylePage.step2", { name }),
    t("stylePage.step3"),
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
                <span className="text-sm text-muted-foreground">{t("stylePage.badge")}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-5 text-balance">
                {name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-pretty">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href={`/create?style=${pack.id}`}>{t("stylePage.cta.primary")}</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-border text-foreground bg-transparent" asChild>
                  <Link href="/#styles">{t("stylePage.cta.secondary")}</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border shadow-sm">
                <img
                  src={pack.sampleImage}
                  alt={t("stylePack.sampleAlt", { name })}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t("stylePage.section.overview")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {description}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("stylePage.section.tags")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {pack.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("stylePage.section.recommended")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>{t("stylePage.recommended.ratio", { ratio: pack.recommended.aspectRatio })}</p>
                <p>{t("stylePage.recommended.size", { size: pack.recommended.imageSize })}</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("stylePage.section.how")}
            </h2>
            <div className="grid gap-6 md:grid-cols-3 mt-6">
              {steps.map((step, index) => (
                <Card key={step}>
                  <CardContent className="pt-6">
                    <p className="text-sm font-semibold text-foreground">
                      {index + 1}. {step}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
