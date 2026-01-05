import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">登录</h1>
            <p className="text-muted-foreground">MVP 将提供最少一种登录方式（邮箱或第三方登录）。</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>登录入口</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">阶段 3 接入登录与订阅校验。</CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/create">继续创建流程</Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

