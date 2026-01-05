import Link from "next/link"
import { Sparkles, Twitter, Github, Linkedin, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            准备好生成你的卡通头像了吗？
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto text-pretty">
            上传 1 张自拍，选择画风包，即可生成 4 张卡通形象照供挑选下载。
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" asChild>
            <Link href="/create">开始生成</Link>
          </Button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground">卡通头像</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                一张自拍，多种画风。快速生成专属于你的卡通头像。
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Products</h4>
              <ul className="space-y-3">
                {["风格包", "创建任务", "结果下载", "订阅计划"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-3">
                {["Documentation", "API Reference", "Tutorials", "Blog", "Community"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3">
                {["About Us", "Careers", "Press Kit", "Contact", "Partners"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Cartoon Avatar. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
