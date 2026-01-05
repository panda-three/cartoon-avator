import { Sparkles, Video, ImageIcon, Wand2, Shield, Zap, Users, Palette } from "lucide-react"

const features = [
  {
    icon: Video,
    title: "Image to Video",
    description:
      "Transform static images into stunning, dynamic videos with natural movement and professional quality.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Wand2,
    title: "Text to Video",
    description: "Describe your vision in words and watch it come to life as a beautiful video in seconds.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: ImageIcon,
    title: "AI Image Generator",
    description: "Create stunning visuals from text prompts with quality rivaling professional design tools.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: Palette,
    title: "Photo to Anime",
    description: "Convert your photos into beautiful anime-style artwork while preserving the original feel.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    icon: Shield,
    title: "Privacy Protection",
    description: "All your data stays secure with end-to-end encryption, ensuring complete privacy.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Zap,
    title: "One-Click Generation",
    description: "Generate professional-quality content with just one click - no technical expertise required.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Users,
    title: "AI Headshot Generator",
    description: "Elevate any snapshot to a stunning professional headshot in a flash.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: Sparkles,
    title: "AI Image Enhancer",
    description: "Revitalize old photos, perfect portraits, and boost landscapes with pro-level results.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Powerful AI Tools at Your Fingertips
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to create stunning visual content powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
