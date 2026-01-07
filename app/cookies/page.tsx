"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"

type Section = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export default function CookiePolicyPage() {
  const { locale, t } = useI18n()
  const isZh = locale === "zh"

  const sections: Section[] = isZh
    ? [
        {
          title: "我们为什么使用 Cookie",
          paragraphs: [
            "我们使用必要的 Cookie/本地存储来保证网站正常运行，例如保存语言偏好与会话状态。",
          ],
        },
        {
          title: "可能使用的类型",
          paragraphs: ["根据功能需要，我们可能使用："],
          bullets: [
            "必要 Cookie：用于站点基本功能（例如登录状态与语言偏好）",
            "分析相关：用于了解页面访问与改进体验（如启用）",
          ],
        },
        {
          title: "如何管理",
          paragraphs: [
            "你可以通过浏览器设置删除或禁用 Cookie。禁用必要 Cookie 可能会导致部分功能不可用。",
          ],
        },
      ]
    : [
        {
          title: "Why we use cookies",
          paragraphs: [
            "We use essential cookies/local storage to keep the site working, such as storing language preference and session state.",
          ],
        },
        {
          title: "Types we may use",
          paragraphs: ["Depending on features enabled, we may use:"],
          bullets: [
            "Essential cookies: required for core site functionality (for example, sign-in state and locale preference)",
            "Analytics: to understand usage and improve the experience (if enabled)",
          ],
        },
        {
          title: "How to manage",
          paragraphs: [
            "You can delete or disable cookies in your browser settings. Disabling essential cookies may prevent parts of the service from working properly.",
          ],
        },
      ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">
              {isZh ? "Cookie 政策" : "Cookie Policy"}
            </h1>
            <p className="text-muted-foreground">
              {isZh ? "本页面说明我们如何使用 Cookie/本地存储。" : "This page explains how we use cookies and local storage."}
            </p>
            <p className="text-xs text-muted-foreground pt-2">
              {isZh ? "最后更新：" : "Last updated: "}{" "}
              {new Date().toISOString().slice(0, 10)}
            </p>
          </div>

          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                {section.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}

          <div className="text-xs text-muted-foreground">
            {isZh ? "更多信息请查看隐私政策。" : "For more information, see our Privacy Policy."}{" "}
            <a className="underline" href="/privacy">
              {t("footer.link.privacy")}
            </a>
            .
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

