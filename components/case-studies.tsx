"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const cases = [
  {
    id: 1,
    title: "Portrait Animation",
    description: "Transform static portraits into lifelike animated videos with natural expressions and movements.",
    image: "/ai-animated-portrait-woman-smiling-soft-lighting.jpg",
    category: "Image to Video",
  },
  {
    id: 2,
    title: "Landscape Cinematic",
    description: "Create stunning cinematic landscape videos from a single photograph with dynamic camera movements.",
    image: "/cinematic-mountain-landscape-sunset-clouds-moving.jpg",
    category: "Text to Video",
  },
  {
    id: 3,
    title: "Anime Transformation",
    description: "Convert photos into beautiful anime-style animated sequences with authentic Japanese aesthetics.",
    image: "/anime-style-character-colorful-background-animated.jpg",
    category: "Photo to Anime",
  },
  {
    id: 4,
    title: "Product Showcase",
    description: "Generate professional product videos that highlight features with smooth 360-degree rotations.",
    image: "/product-showcase-3d-rotation-professional-lighting.jpg",
    category: "Commercial",
  },
  {
    id: 5,
    title: "Social Media Content",
    description: "Create engaging short-form videos perfect for TikTok, Instagram Reels, and YouTube Shorts.",
    image: "/trendy-social-media-video-content-creator.jpg",
    category: "Social Media",
  },
]

export function CaseStudies() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % cases.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + cases.length) % cases.length)
  }

  return (
    <section id="cases" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Showcase Gallery
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Explore amazing creations made with our AI video generator by users around the world.
          </p>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          {cases.slice(0, 3).map((item) => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-card border border-border">
              <div className="aspect-video relative">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">{item.category}</span>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="lg:hidden">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {cases.map((item) => (
                  <div key={item.id} className="w-full flex-shrink-0">
                    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border mx-2">
                      <div className="aspect-video relative">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary-foreground ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-5">
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="rounded-full border-border bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex gap-2">
                {cases.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="rounded-full border-border bg-transparent"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Cases Row */}
        <div className="hidden lg:grid grid-cols-2 gap-6 mt-6">
          {cases.slice(3, 5).map((item) => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-card border border-border flex">
              <div className="w-1/2 aspect-video relative">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary-foreground ml-1" />
                  </div>
                </div>
              </div>
              <div className="w-1/2 p-6 flex flex-col justify-center">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">{item.category}</span>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
