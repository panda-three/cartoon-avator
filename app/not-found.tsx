import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">页面不存在</h1>
            <p className="text-muted-foreground">你访问的地址可能已被删除或链接有误。</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>你可以尝试</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <div>1) 返回首页重新开始</div>
              <div>2) 去创建页生成新的任务</div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/">返回首页</Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/create">去创建页</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

