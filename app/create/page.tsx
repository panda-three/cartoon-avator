import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CreateForm } from "@/app/create/create-form"

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">创建卡通头像</h1>
          <p className="text-muted-foreground mb-8">
            上传 1 张自拍，选择风格包并微调参数。创建任务后可在结果页查看生成进度与结果。
          </p>
          <Suspense fallback={<div className="text-sm text-muted-foreground">加载中…</div>}>
            <CreateForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
