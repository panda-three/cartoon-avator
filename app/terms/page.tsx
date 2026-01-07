"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/components/i18n-provider"

function getSupportEmail(): string | null {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()
  if (!email) return null
  if (!email.includes("@")) return null
  return email
}

type Section = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export default function TermsPage() {
  const { locale, t } = useI18n()
  const supportEmail = getSupportEmail()
  const isZh = locale === "zh"

  const sections: Section[] = isZh
    ? [
        {
          title: "服务说明",
          paragraphs: [
            `欢迎使用「${t("app.name")}」。本服务允许你上传图片并生成卡通头像等内容。使用本服务即表示你同意本条款。`,
          ],
        },
        {
          title: "订阅与付款",
          paragraphs: [
            "订阅为按月自动续费，具体价格与权益以订阅页显示为准。",
            "支付与订阅状态由 Creem 处理。你应确保付款方式有效；如扣款失败，订阅可能暂停或失效。",
          ],
        },
        {
          title: "可接受使用",
          paragraphs: ["你同意不会使用本服务从事以下行为："],
          bullets: [
            "上传或生成违法、色情、暴力、仇恨、骚扰或其他不当内容",
            "侵犯他人隐私、肖像权、著作权或其他合法权益",
            "尝试绕过额度/订阅限制、滥用接口或攻击系统",
          ],
        },
        {
          title: "内容与版权",
          paragraphs: [
            "你应确保上传内容拥有必要的权利与授权。",
            "生成内容的可用性与效果可能受模型与输入质量影响；我们不保证每次生成都满足你的预期。",
          ],
        },
        {
          title: "数据与隐私",
          paragraphs: [
            "我们会按隐私政策处理你的信息（包括上传图片与生成结果的保存期与删除）。",
          ],
        },
        {
          title: "免责声明与责任限制",
          paragraphs: [
            "本服务按“现状”提供。在法律允许的最大范围内，我们不对因使用本服务造成的间接损失承担责任。",
          ],
        },
        {
          title: "联系我们",
          paragraphs: [
            supportEmail
              ? `如对条款或订阅有疑问，请联系：${supportEmail}`
              : "如对条款或订阅有疑问，请通过站内联系方式与我们联系。",
          ],
        },
      ]
    : [
        {
          title: "Service overview",
          paragraphs: [
            `Welcome to ${t("app.name")}. The service lets you upload images and generate outputs such as cartoon avatars. By using the service, you agree to these Terms.`,
          ],
        },
        {
          title: "Subscription and billing",
          paragraphs: [
            "Subscriptions auto-renew monthly. Pricing and benefits are shown on the pricing page.",
            "Payments and subscription status are processed by Creem. If payment fails, your subscription may be paused or become inactive.",
          ],
        },
        {
          title: "Acceptable use",
          paragraphs: ["You agree not to use the service to:"],
          bullets: [
            "Upload or generate illegal, sexual, violent, hateful, harassing, or otherwise inappropriate content",
            "Infringe others’ privacy, publicity rights, copyrights, or other legal rights",
            "Bypass quota/subscription limits, abuse the service, or attack the system",
          ],
        },
        {
          title: "Content and rights",
          paragraphs: [
            "You represent that you have the necessary rights/permissions for content you upload.",
            "Outputs may vary in quality and are not guaranteed to meet your expectations.",
          ],
        },
        {
          title: "Privacy",
          paragraphs: ["We handle your information according to the Privacy Policy, including retention and deletion options."],
        },
        {
          title: "Disclaimers and limitation of liability",
          paragraphs: ["The service is provided “as is”. To the maximum extent permitted by law, we are not liable for indirect damages arising from use of the service."],
        },
        {
          title: "Contact",
          paragraphs: [supportEmail ? `Questions? Contact us at ${supportEmail}.` : "Questions? Contact us via the website contact information."],
        },
      ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">
              {isZh ? "服务条款" : "Terms of Service"}
            </h1>
            <p className="text-muted-foreground">
              {isZh ? "使用本服务前请阅读本条款。" : "Please read these Terms before using the service."}
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
            {isZh ? "同时建议阅读隐私政策。" : "You should also read our Privacy Policy."}{" "}
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

