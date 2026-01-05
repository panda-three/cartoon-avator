"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, ImageIcon, Type, Sparkles, X, Loader2 } from "lucide-react"

export function VideoGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [textPrompt, setTextPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("image")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  const clearImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <section id="generator" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Create Your AI Video
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Upload an image or describe your vision to generate stunning AI videos.
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
              <TabsTrigger
                value="image"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ImageIcon className="w-4 h-4" />
                Image to Video
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Type className="w-4 h-4" />
                Text to Video
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="mt-0">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-colors ${
                  uploadedImage ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Uploaded preview"
                      className="max-h-64 mx-auto rounded-xl object-contain"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                    >
                      <X className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-foreground font-medium mb-2">Drag and drop your image here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-0">
              <div className="space-y-4">
                <textarea
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="Describe the video you want to create... e.g., 'A serene mountain landscape at sunset with clouds slowly drifting by'"
                  className="w-full h-40 p-4 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-sm text-muted-foreground">
                  Tip: Be descriptive about scenes, movements, and mood for better results.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Powered by advanced AI models</span>
            </div>
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || (activeTab === "image" ? !uploadedImage : !textPrompt)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-5 h-5" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
