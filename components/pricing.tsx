import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const planFeatures = [
  "每次生成产出 4 张",
  "同一用户同时最多 1 个任务",
  "历史记录展示最近 30 次",
  "默认保存 7 天，支持删除",
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            订阅计划
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            订阅后即可创建生成任务（按月自动续费）。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>订阅（按月）</CardTitle>
              <CardDescription>具体价格与月度额度在订阅页展示</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="border-t">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/pricing">查看订阅</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>需要更多？</CardTitle>
              <CardDescription>后续可增加更多套餐档位</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                MVP 阶段先以 1–2 档订阅为主，支持画风包选择、任务队列与历史记录。
              </p>
            </CardContent>
            <CardFooter className="border-t">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/create">先体验创建流程</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}

