import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Shield, Palette, Wand2 } from "lucide-react"
import { getActiveStylePacks } from "@/lib/style-packs"

export function Hero() {
  const previewPacks = getActiveStylePacks().slice(0, 4)

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">一张自拍 · 多种画风</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight text-balance">
            创建属于你的{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">卡通头像</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-pretty">
            上传 1 张自拍，选择风格包，生成 4 张卡通形象照供挑选下载。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
              asChild
            >
              <Link href="/create">
                开始生成 <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground px-8 py-6 text-lg bg-transparent" asChild>
              <a href="#styles">查看画风</a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <span>画风优先</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span>默认保存 7 天</span>
            </div>
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              <span>无需写 Prompt</span>
            </div>
          </div>
        </div>

        {/* Hero Images Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewPacks.map((pack, i) => (
            <div
              key={pack.id}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden group animate-float"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <img
                src={pack.sampleImage}
                alt={`${pack.name} 示例图`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {pack.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
