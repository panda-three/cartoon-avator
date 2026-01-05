import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getActiveStylePacks } from "@/lib/style-packs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function StylePackGallery() {
  const packs = getActiveStylePacks()

  return (
    <section id="styles" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            选择你的画风
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            预设风格包，上传 1 张自拍，生成 4 张卡通头像供挑选。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <Card key={pack.id} className="overflow-hidden">
              <div className="aspect-square bg-secondary">
                <img
                  src={pack.sampleImage}
                  alt={`${pack.name} 示例图`}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{pack.name}</CardTitle>
                <CardDescription>{pack.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-2">
                {pack.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardContent>

              <CardFooter className="border-t">
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={`/create?style=${pack.id}`}>
                    使用此风格 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

