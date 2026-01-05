import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { StylePackGallery } from "@/components/style-pack-gallery"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <StylePackGallery />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
