"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { getActiveStylePacks, getStylePackDescription, getStylePackName } from "@/lib/style-packs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function StylePackGallery() {
  const { locale, t } = useI18n()
  const packs = getActiveStylePacks()

  return (
    <section id="styles" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            {t("styles.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("styles.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <Card key={pack.id} className="overflow-hidden">
              <div className="aspect-square bg-secondary">
                <img
                  src={pack.sampleImage}
                  alt={t("stylePack.sampleAlt", { name: getStylePackName(pack, locale) })}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{getStylePackName(pack, locale)}</CardTitle>
                <CardDescription>{getStylePackDescription(pack, locale)}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-2">
                {pack.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardContent>

              <CardFooter className="border-t">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/create?style=${pack.id}`}>
                    {t("styles.useStyle")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
