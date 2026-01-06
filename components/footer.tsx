"use client"

import Link from "next/link"
import { Sparkles, Twitter, Github, Linkedin, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"

export function Footer() {
  const { t } = useI18n()

  const productItems = t("footer.products.items").split("|")
  const resourceItems = t("footer.resources.items").split("|")
  const companyItems = t("footer.company.items").split("|")
  const legalItems = t("footer.legal.items").split("|")

  return (
    <footer className="border-t border-border bg-card/50">
      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            {t("footer.cta.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto text-pretty">
            {t("footer.cta.subtitle")}
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" asChild>
            <Link href="/create">{t("footer.cta.button")}</Link>
          </Button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">{t("app.name")}</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                {t("footer.tagline")}
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.products")}</h4>
              <ul className="space-y-3">
                {productItems.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.resources")}</h4>
              <ul className="space-y-3">
                {resourceItems.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.company")}</h4>
              <ul className="space-y-3">
                {companyItems.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.legal")}</h4>
              <ul className="space-y-3">
                {legalItems.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t("footer.link.privacy")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t("footer.link.terms")}
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t("footer.link.cookies")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
