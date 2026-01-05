import "server-only"

import { z } from "zod"

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

const OpenRouterImageSchema = z.object({
  image_url: z.object({
    url: z.string(),
  }),
})

const OpenRouterMessageSchema = z.object({
  content: z.unknown().optional(),
  images: z.array(OpenRouterImageSchema).optional(),
})

const OpenRouterChoiceSchema = z.object({
  message: OpenRouterMessageSchema,
})

const OpenRouterChatCompletionSchema = z.object({
  choices: z.array(OpenRouterChoiceSchema),
})

export type OpenRouterChatCompletion = z.infer<typeof OpenRouterChatCompletionSchema>

function getEnv(name: string): string | undefined {
  const value = process.env[name]
  if (!value) return undefined
  return value.trim() || undefined
}

export function getOpenRouterApiKey(): string | undefined {
  return getEnv("OPENROUTER_API_KEY")
}

export function getOpenRouterModel(defaultModel: string): string {
  return getEnv("OPENROUTER_MODEL") ?? defaultModel
}

export function getOpenRouterVisionModel(defaultModel: string): string {
  return getEnv("OPENROUTER_VISION_MODEL") ?? getOpenRouterModel(defaultModel)
}

export function getOpenRouterImageModel(defaultModel: string): string {
  return getEnv("OPENROUTER_IMAGE_MODEL") ?? getOpenRouterModel(defaultModel)
}

export async function openRouterChatCompletions(
  payload: Record<string, unknown>,
  { timeoutMs, signal }: { timeoutMs: number; signal?: AbortSignal },
): Promise<OpenRouterChatCompletion> {
  const apiKey = getOpenRouterApiKey()
  if (!apiKey) throw new Error("缺少 OPENROUTER_API_KEY")

  const controller = new AbortController()
  const timeoutError = Object.assign(new Error("OpenRouter 超时，请稍后重试"), { code: "OPENROUTER_TIMEOUT" })
  const timeout = setTimeout(() => controller.abort(timeoutError), timeoutMs)

  const abortFromUpstream = () => controller.abort(signal?.reason)
  if (signal) {
    if (signal.aborted) abortFromUpstream()
    else signal.addEventListener("abort", abortFromUpstream, { once: true })
  }

  try {
    const res = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": getEnv("OPENROUTER_SITE_URL") ?? "http://localhost:3000",
        "X-Title": getEnv("OPENROUTER_APP_NAME") ?? "Cartoon Avatar",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    const raw = await res.text()
    if (!res.ok) {
      const err = Object.assign(new Error(`OpenRouter 调用失败（${res.status}）：${raw.slice(0, 500)}`), {
        code: `OPENROUTER_HTTP_${res.status}`,
        status: res.status,
      })
      throw err
    }

    const parsed = OpenRouterChatCompletionSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      throw Object.assign(new Error("OpenRouter 响应解析失败"), { code: "OPENROUTER_PARSE_ERROR" })
    }

    return parsed.data
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      const reason = controller.signal.reason
      if (reason instanceof Error) throw reason
      if (typeof reason === "string") throw Object.assign(new Error(reason), { code: "OPENROUTER_ABORTED" })
      throw timeoutError
    }
    throw err
  } finally {
    clearTimeout(timeout)
    if (signal && !signal.aborted) {
      signal.removeEventListener("abort", abortFromUpstream)
    }
  }
}

export function extractTextFromCompletion(data: OpenRouterChatCompletion): string {
  const choice = data.choices[0]
  if (!choice) return ""
  const content = choice.message.content

  if (typeof content === "string") return content

  if (Array.isArray(content)) {
    const parts = content
      .map((item) => {
        if (typeof item === "string") return item
        if (!item || typeof item !== "object") return ""
        const maybeText = (item as { text?: unknown }).text
        if (typeof maybeText === "string") return maybeText
        return ""
      })
      .filter(Boolean)
    return parts.join("\n")
  }

  return ""
}

export function extractImageUrlsFromCompletion(data: OpenRouterChatCompletion): string[] {
  const urls: string[] = []

  for (const choice of data.choices) {
    const images = choice.message.images ?? []
    for (const image of images) {
      urls.push(image.image_url.url)
    }

    const content = choice.message.content
    if (Array.isArray(content)) {
      for (const item of content) {
        if (!item || typeof item !== "object") continue
        const type = (item as { type?: unknown }).type
        if (type !== "image_url") continue
        const imageUrl = (item as { image_url?: unknown }).image_url
        if (!imageUrl || typeof imageUrl !== "object") continue
        const url = (imageUrl as { url?: unknown }).url
        if (typeof url === "string") urls.push(url)
      }
    }
  }

  return urls
}
