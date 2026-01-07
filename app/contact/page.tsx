"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"

function getSupportEmail(): string | null {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()
  if (!email) return null
  if (!email.includes("@")) return null
  return email
}

export default function ContactPage() {
  const { locale, t } = useI18n()
  const supportEmail = getSupportEmail()
  const isZh = locale === "zh"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">
              {isZh ? "联系我们" : "Contact"}
            </h1>
            <p className="text-muted-foreground">
              {isZh ? "如果你需要帮助或有任何问题，请通过下方方式联系我们。" : "Need help or have a question? Reach us here."}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isZh ? "客服邮箱" : "Support email"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              {supportEmail ? (
                <div>
                  <a className="underline" href={`mailto:${supportEmail}`}>
                    {supportEmail}
                  </a>
                </div>
              ) : (
                <div>{isZh ? "暂未提供客服邮箱。" : "Support email is not available."}</div>
              )}

              <div>
                <Link className="underline" href="/privacy">
                  {isZh ? "隐私政策" : "Privacy Policy"}
                </Link>
                {" · "}
                <Link className="underline" href="/terms">
                  {isZh ? "服务条款" : "Terms of Service"}
                </Link>
                {" · "}
                <Link className="underline" href="/cookies">
                  {isZh ? "Cookie 政策" : "Cookie Policy"}
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/">{t("common.backHome")}</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/create">{t("common.goCreate")}</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

