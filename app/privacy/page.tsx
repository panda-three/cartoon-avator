"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"
import { getSupportEmail } from "@/lib/support"

type Section = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export default function PrivacyPolicyPage() {
  const { locale, t } = useI18n()
  const supportEmail = getSupportEmail()
  const isZh = locale === "zh"

  const sections: Section[] = isZh
    ? [
        {
          title: "我们收集哪些信息",
          paragraphs: [
            "为提供服务与保障安全，我们可能会收集以下信息：",
          ],
          bullets: [
            "账户信息：如邮箱等用于登录/识别的基本信息",
            "你上传的图片与生成结果：用于完成生成任务与提供下载",
            "使用数据：例如生成任务状态、用量/额度、错误日志（用于改进稳定性与排查问题）",
            "支付相关信息：由 PayPal 处理；我们不会直接存储你的银行卡信息",
          ],
        },
        {
          title: "我们如何使用这些信息",
          paragraphs: ["我们使用上述信息来："],
          bullets: [
            "提供并维护核心功能（上传、生成、展示与下载）",
            "处理订阅状态与额度（例如校验是否可创建任务）",
            "提供客服支持与沟通",
            "保护服务安全、防止滥用与欺诈",
          ],
        },
        {
          title: "图片保存期与删除",
          paragraphs: [
            "默认情况下，你上传的图片与生成结果会保存 7 天。你可以在账户页删除上传原图与生成结果；删除后将无法再次访问。",
            "为满足法律合规或安全需要，我们可能会在合理范围内保留必要的日志与记录。",
          ],
        },
        {
          title: "第三方服务与共享",
          paragraphs: [
            "为提供服务，我们可能会与第三方服务商共享必要的数据（仅限于提供服务所需）：",
          ],
          bullets: [
            "图片生成：通过 OpenRouter 调用模型服务以完成生成任务",
            "支付与订阅：通过 PayPal 处理支付与订阅状态",
            "基础设施：托管、存储与日志服务（用于提供网站与稳定性）",
          ],
        },
        {
          title: "Cookie 与本地存储",
          paragraphs: [
            "我们可能使用必要的 Cookie/本地存储来保存语言偏好、会话状态等，以确保网站正常运行。",
          ],
        },
        {
          title: "联系我们",
          paragraphs: [
            `如对本隐私政策有疑问，请联系：${supportEmail}`,
          ],
        },
      ]
    : [
        {
          title: "Information we collect",
          paragraphs: ["To provide the service and keep it secure, we may collect:"],
          bullets: [
            "Account info: basic identifiers such as email for sign-in",
            "Uploaded images and generated outputs: to run jobs and enable downloads",
            "Usage data: job status, quota/usage, and error logs for reliability and debugging",
            "Payment info: processed by PayPal; we do not store your card details directly",
          ],
        },
        {
          title: "How we use information",
          paragraphs: ["We use this information to:"],
          bullets: [
            "Operate core features (upload, generate, display, download)",
            "Manage subscriptions and quota (for example, checking whether you can create jobs)",
            "Provide customer support and communication",
            "Protect the service (abuse prevention and security)",
          ],
        },
        {
          title: "Retention and deletion",
          paragraphs: [
            "By default, uploaded images and generated outputs are stored for 7 days. You can delete uploads and results from the account page; deleted items can’t be accessed again.",
            "We may retain limited logs as needed for security, compliance, and service reliability.",
          ],
        },
        {
          title: "Third-party services",
          paragraphs: ["We may share necessary data with service providers to deliver the product:"],
          bullets: [
            "Image generation: via OpenRouter to run model inference for your jobs",
            "Billing: via PayPal for payments and subscription status",
            "Infrastructure: hosting, storage, and logging providers to run the website reliably",
          ],
        },
        {
          title: "Cookies and local storage",
          paragraphs: [
            "We may use essential cookies/local storage for things like language preference and session state so the site can function properly.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `Questions? Contact us at ${supportEmail}.`,
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
              {isZh ? "隐私政策" : "Privacy Policy"}
            </h1>
            <p className="text-muted-foreground">
              {isZh ? "本页面说明我们如何收集、使用与保护你的信息。" : "This page explains how we collect, use, and protect your information."}
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
            {isZh
              ? `如需查看条款，请访问「服务条款」页面。`
              : `For terms, please see the Terms of Service page.`}{" "}
            <a className="underline" href="/terms">
              {t("footer.link.terms")}
            </a>
            .
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
