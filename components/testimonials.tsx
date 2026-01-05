"use client"

import { useState } from "react"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Content Creator",
    avatar: "/avatar-1.png",
    content:
      "Supawork AI has completely transformed my content creation workflow. I can now produce stunning videos in minutes instead of hours. The quality is absolutely incredible!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Marketing Director",
    avatar: "/professional-asian-man-headshot-business.jpg",
    content:
      "The image-to-video feature is a game-changer for our marketing campaigns. We've seen a 300% increase in engagement since we started using Supawork AI.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Social Media Manager",
    avatar: "/professional-latina-woman-headshot-friendly.jpg",
    content:
      "I love how easy it is to create professional-looking videos. The AI understands exactly what I want and delivers beyond my expectations every single time.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Kim",
    role: "Freelance Designer",
    avatar: "/creative-professional-man-headshot-casual.jpg",
    content:
      "As a designer, I'm very particular about quality. Supawork AI delivers results that I'm proud to show my clients. It's become an essential tool in my toolkit.",
    rating: 5,
  },
  {
    id: 5,
    name: "Amanda Foster",
    role: "Startup Founder",
    avatar: "/professional-woman-entrepreneur-headshot-confident.jpg",
    content:
      "We were able to create our entire video marketing strategy using Supawork AI. It saved us thousands of dollars and the results look absolutely professional.",
    rating: 5,
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Loved by Creators Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Join thousands of satisfied users who are creating amazing content with our AI tools.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div key={testimonial.id} className="p-6 rounded-2xl bg-card border border-border relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed">{testimonial.content}</p>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                  <div className="p-6 rounded-2xl bg-card border border-border relative">
                    <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{testimonial.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full border-border bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full border-border bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-border">
          {[
            { value: "10M+", label: "Videos Created" },
            { value: "500K+", label: "Happy Users" },
            { value: "4.9/5", label: "User Rating" },
            { value: "50+", label: "AI Models" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
