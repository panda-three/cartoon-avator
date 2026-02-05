import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PricingPage as PricingPageContent } from "@/components/pricing-page"

export default function PricingPageRoute() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PricingPageContent />
      </main>
      <Footer />
    </div>
  )
}
