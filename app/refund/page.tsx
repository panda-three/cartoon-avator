"use client"

import Link from "next/link"
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

export default function RefundPolicyPage() {
  const { locale, t } = useI18n()
  const isZh = locale === "zh"
  const supportEmail = getSupportEmail()

  const sections: Section[] = isZh
    ? [
        {
          title: "概述",
          paragraphs: [
            `本退款政策适用于 ${t("app.name")}（“我们”）提供的数字化头像生成服务。`,
            `如对退款或取消订阅有任何疑问，请联系：${supportEmail}。`,
          ],
        },
        {
          title: "订阅与取消",
          paragraphs: [
            "订阅按周期计费，到期前可续订以保持服务。",
            "如不续订，将不再扣款，你仍可使用已购买周期内的服务权益，直至当期结束。",
            "支付由 PayPal 处理；退款将退回原支付方式。",
          ],
        },
        {
          title: "退款规则",
          paragraphs: ["由于服务为数字化内容/即时可用服务，退款规则如下："],
          bullets: [
            "如在当期订阅购买/续费后 7 天内提出申请且当期未发生任何成功生成（未消耗额度），可申请全额退款",
            "如当期已发生成功生成（已消耗额度），通常不提供当期退款",
            "如发生重复扣款、误扣款或未经授权扣款，请尽快联系我们核实处理",
            "如出现严重服务故障导致无法正常使用，我们可能提供延期/补偿额度或酌情退款",
          ],
        },
        {
          title: "如何申请退款",
          paragraphs: ["请发送邮件至客服邮箱，并提供以下信息以便我们尽快处理："],
          bullets: ["你的账号邮箱", "PayPal 订单/交易号（如有）", "退款原因与相关说明（截图/时间等）"],
        },
        {
          title: "处理时效",
          paragraphs: [
            "我们通常会在 3 个工作日内回复你的请求。",
            "退款一经批准，将退回原支付方式；到账时间取决于支付渠道/银行，通常为 5–10 个工作日。",
          ],
        },
      ]
    : [
        {
          title: "Overview",
          paragraphs: [
            `This Refund Policy applies to the digital avatar generation service provided by ${t("app.name")}.`,
            `Questions about refunds or cancellations? Contact us at ${supportEmail}.`,
          ],
        },
        {
          title: "Subscriptions and cancellation",
          paragraphs: [
            "Subscriptions are billed by period. Renew before the next billing date to keep access.",
            "If you choose not to renew, you won’t be charged again and you can keep using the service until the end of the current billing period.",
            "Payments are processed by PayPal; approved refunds are returned to the original payment method.",
          ],
        },
        {
          title: "Refund rules",
          paragraphs: ["Because this is a digital service with immediate access, our refund rules are:"],
          bullets: [
            "If you request a refund within 7 days of a purchase/renewal and no successful generations occurred in the current billing period (no quota used), you may request a full refund",
            "If successful generations occurred in the current billing period (quota used), refunds for that period are generally not available",
            "For duplicate, mistaken, or unauthorized charges, contact us promptly so we can investigate and resolve the issue",
            "If there is a major service outage that prevents normal usage, we may provide an extension, compensatory quota, or a refund at our discretion",
          ],
        },
        {
          title: "How to request a refund",
          paragraphs: ["Email our support address with the following details:"],
          bullets: ["Your account email", "PayPal order/transaction ID (if available)", "Reason for the request and any supporting context (screenshots/timestamps)"],
        },
        {
          title: "Processing time",
          paragraphs: [
            "We typically respond within 3 business days.",
            "If approved, refunds are issued to the original payment method. Timing depends on your bank/payment provider, usually 5–10 business days.",
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
              {isZh ? "退款政策" : "Refund Policy"}
            </h1>
            <p className="text-muted-foreground">
              {isZh ? "本页面说明取消订阅与退款处理规则。" : "This page explains cancellation and refund rules."}
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
            {isZh ? "如需帮助，请访问联系我们页面：" : "Need help? See our contact page:"}{" "}
            <Link className="underline" href="/contact">
              {t("footer.link.contact")}
            </Link>
            .
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
