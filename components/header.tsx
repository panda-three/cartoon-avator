"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Globe, Menu, Sparkles, X } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [switchingLocale, setSwitchingLocale] = useState(false)
  const router = useRouter()
  const { locale, t } = useI18n()

  const toggleLocale = async () => {
    setSwitchingLocale(true)
    try {
      const nextLocale = locale === "en" ? "zh" : "en"
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      })
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSwitchingLocale(false)
    }
  }

  const toggleLabel = locale === "en" ? t("header.language.toggle.zh") : t("header.language.toggle.en")

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">{t("app.name")}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#styles" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.styles")}
            </Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.pricing")}
            </Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.faq")}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={toggleLocale}
              disabled={switchingLocale}
            >
              <Globe className="mr-2 h-4 w-4" />
              {toggleLabel}
            </Button>
            <Button variant="ghost" className="text-foreground" asChild>
              <Link href="/login">{t("header.login")}</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/create">{t("header.start")}</Link>
            </Button>
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="flex flex-col p-4 gap-4">
            <Link href="/#styles" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.styles")}
            </Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.pricing")}
            </Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.faq")}
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={toggleLocale}
                disabled={switchingLocale}
              >
                <Globe className="mr-2 h-4 w-4" />
                {toggleLabel}
              </Button>
              <Button variant="ghost" className="w-full text-foreground" asChild>
                <Link href="/login">{t("header.login")}</Link>
              </Button>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/create">{t("header.start")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
