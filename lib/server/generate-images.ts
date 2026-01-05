import "server-only"

import { getStylePackById } from "@/lib/style-packs"
import type { JobProvider } from "@/lib/jobs"
import {
  extractImageUrlsFromCompletion,
  extractTextFromCompletion,
  getOpenRouterImageModel,
  getOpenRouterVisionModel,
  openRouterChatCompletions,
} from "@/lib/server/openrouter"

function isModelUnsupportedError(err: unknown) {
  if (!(err instanceof Error)) return false
  const message = err.message
  return message.includes("The request is not supported by this model") || message.includes("not supported by this model")
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message
  return "未知错误"
}

function getErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined
  const maybe = (err as { code?: unknown }).code
  return typeof maybe === "string" ? maybe : undefined
}

function wrapError(prefix: string, err: unknown): Error {
  const next = new Error(`${prefix}：${getErrorMessage(err)}`)
  const code = getErrorCode(err)
  if (code) Object.assign(next, { code })
  return next
}

export async function generateImagesForJob({
  inputImageUrl,
  stylePackId,
  identityStrength,
  provider,
  signal,
}: {
  inputImageUrl: string
  stylePackId: string
  identityStrength: number
  provider: JobProvider
  signal?: AbortSignal
}): Promise<string[]> {
  const stylePack = getStylePackById(stylePackId)

  if (provider === "mock") {
    const placeholder = stylePack?.sampleImage ?? "/icon.svg"
    return Array.from({ length: 4 }, () => placeholder)
  }

  const DEFAULT_VISION_MODEL = "google/gemini-2.5-flash"
  const DEFAULT_IMAGE_MODEL = "google/gemini-2.5-flash-image-preview"
  const visionModel = getOpenRouterVisionModel(DEFAULT_VISION_MODEL)
  const imageModel = getOpenRouterImageModel(DEFAULT_IMAGE_MODEL)

  const identity = Math.max(0, Math.min(100, Math.round(identityStrength)))
  const style = 100 - identity

  let description: string | null = null

  try {
    const descriptionCompletion = await openRouterChatCompletions(
      {
        model: visionModel,
        messages: [
          {
            role: "system",
            content:
              "You are a visual analysis assistant. Describe a person's appearance for portrait illustration. Do not infer identity or sensitive traits.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: [
                  "From the selfie, extract a structured appearance description useful for drawing a cartoon avatar.",
                  "Return a concise bullet list in English, focusing on: face shape, skin tone, hairstyle/hair color, eyebrows, eyes, glasses/accessories, facial hair, expression, clothing collar/top, notable unique features.",
                  "Avoid guessing age, ethnicity, nationality, or identity.",
                ].join("\n"),
              },
              { type: "image_url", image_url: { url: inputImageUrl } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      },
      { timeoutMs: 60_000, signal },
    )

    const extracted = extractTextFromCompletion(descriptionCompletion).trim()
    description = extracted || null
  } catch (err) {
    if (!isModelUnsupportedError(err)) {
      throw wrapError("视觉描述失败", err)
    }
  }

  const includeReferenceImage = !description

  const buildPrompt = ({ count, variation }: { count: number; variation?: number }) => {
    const header = count === 1 ? "Generate 1 square (1:1) cartoon avatar portrait image." : `Generate ${count} square (1:1) cartoon avatar portrait images.`

    const lines = [
      header,
      "No text, no watermark, simple clean background, head-and-shoulders framing, centered composition.",
      "Safety: family-friendly portrait only. No nudity, sexual content, violence, hate symbols, political content, or minors.",
      "",
      `Style prompt: ${stylePack?.promptTemplate ?? "cartoon avatar portrait"}`,
      `Negative prompt: ${stylePack?.negativePrompt ?? "low quality, blurry, deformed, text, watermark"}`,
      "",
      `Likeness priority (0-100): ${identity}. Style priority (0-100): ${style}.`,
      "If likeness is high, preserve key facial features and accessories. If style is high, lean into the style while keeping the subject recognizable.",
      "",
    ]

    if (description) {
      lines.push("Subject appearance description:", description, "")
    } else {
      lines.push("Use the provided selfie as the identity reference. Preserve key facial features and accessories.", "")
    }

    if (typeof variation === "number") {
      lines.push(`Generate a distinct variation (#${variation}). Do not repeat previous outputs.`)
    }

    return lines.join("\n")
  }

  const requestImages = async ({ count, variation }: { count: number; variation?: number }) => {
    const prompt = buildPrompt({ count, variation })
    try {
      const completion = await openRouterChatCompletions(
        {
          model: imageModel,
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: includeReferenceImage
                ? [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: inputImageUrl } },
                  ]
                : [{ type: "text", text: prompt }],
            },
          ],
          temperature: 0.9,
        },
        { timeoutMs: 120_000, signal },
      )

      return extractImageUrlsFromCompletion(completion)
        .map((url) => url.trim())
        .filter(Boolean)
    } catch (err) {
      if (isModelUnsupportedError(err)) {
        throw Object.assign(
          new Error(
          "风格生图失败：当前模型不支持该请求。请在 `.env.local` 配置 `OPENROUTER_IMAGE_MODEL` 为支持图片输出的模型后重试。",
          ),
          { code: "MODEL_UNSUPPORTED" },
        )
      }
      throw wrapError("风格生图失败", err)
    }
  }

  const collected: string[] = []
  const initial = await requestImages({ count: 4 })
  for (const url of initial) {
    if (!collected.includes(url)) collected.push(url)
  }

  for (let i = collected.length + 1; i <= 4; i++) {
    if (collected.length >= 4) break
    const more = await requestImages({ count: 1, variation: i })
    const url = more.find((candidate) => !collected.includes(candidate))
    if (url) collected.push(url)
  }

  if (!collected.length) {
    throw new Error("生成失败：未获取到图片结果")
  }

  const selected = collected.slice(0, 4)
  while (selected.length < 4) selected.push(selected[selected.length - 1] ?? collected[0]!)
  return selected
}
