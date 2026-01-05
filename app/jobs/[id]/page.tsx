import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { JobClient } from "@/app/jobs/[id]/job-client"

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">生成结果</h1>
            <p className="text-muted-foreground">任务 ID：{id}</p>
          </div>

          <JobClient jobId={id} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
