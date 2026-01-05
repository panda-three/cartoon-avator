"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "这个产品能做什么？",
    answer:
      "上传 1 张自拍，选择一个风格包，即可生成一组卡通形象照（默认 4 张），用于社交头像等场景。",
  },
  {
    question: "我需要准备什么照片？",
    answer:
      "一张清晰正脸自拍即可。建议无遮挡、光线充足、面部占画面比例适中，以提升生成稳定性。",
  },
  {
    question: "生成流程是怎样的？",
    answer:
      "上传自拍 → 选择风格包 →（可选）调节「更像画风 / 更像本人」→ 点击生成 → 在结果页选择下载或再生成一组。",
  },
  {
    question: "图片会保存多久？我能删除吗？",
    answer:
      "默认保存 7 天。你可以在账户页删除上传原图和生成结果，删除后将无法再访问。",
  },
  {
    question: "我需要写提示词（Prompt）吗？",
    answer:
      "不需要。MVP 以预设风格包为主，仅提供少量参数（例如「更像画风 / 更像本人」）来微调效果。",
  },
  {
    question: "生成次数如何扣减？",
    answer:
      "每次生成任务默认产出 4 张，按 1 次计。成功后扣减次数；失败不扣。",
  },
  {
    question: "订阅在哪里开通？",
    answer:
      "在订阅页开通订阅，支付平台使用 Creem。订阅有效且额度充足时可创建生成任务。",
  },
  {
    question: "我可以生成多少次？",
    answer:
      "按订阅套餐的月度额度为准。额度不足时将无法创建新任务。",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            常见问题
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            这里汇总了使用与隐私相关的常见问题。
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border rounded-xl px-6 bg-card data-[state=open]:bg-card/80"
            >
              <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
