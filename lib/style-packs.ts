import type { Locale } from "@/lib/i18n/locale"

type StylePackBase = {
  id: string
  name: Record<Locale, string>
  description: Record<Locale, string>
  tags: string[]
  sampleImage: string
  isActive: boolean
  promptTemplate: string
  negativePrompt: string
  recommended: {
    aspectRatio: "1:1"
    imageSize: "1K"
  }
}

export const stylePacks = [
  {
    id: "anime-line",
    name: { en: "Anime Line Art", zh: "日漫清线" },
    description: { en: "Clean linework with light colors. Great for profile photos.", zh: "线稿清晰、轻上色，适合头像与社交头像。" },
    tags: ["anime", "line"],
    sampleImage: "/style-packs/anime-line/sample.svg",
    isActive: true,
    promptTemplate: "cartoon avatar portrait, clean lineart, soft colors, simple background",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "anime-cel",
    name: { en: "Anime Cel Shading", zh: "日漫赛璐璐" },
    description: { en: "High contrast with crisp color blocks and clean edges.", zh: "高对比、色块分明的赛璐璐上色风格。" },
    tags: ["anime", "cel"],
    sampleImage: "/style-packs/anime-cel/sample.svg",
    isActive: true,
    promptTemplate: "cartoon avatar portrait, cel shading, high contrast, clean edges",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "chibi",
    name: { en: "Chibi", zh: "Q 版大头" },
    description: { en: "Cute proportions with an oversized head, perfect for avatars.", zh: "可爱夸张比例，更适合头像场景。" },
    tags: ["chibi", "cute"],
    sampleImage: "/style-packs/chibi/sample.svg",
    isActive: true,
    promptTemplate: "chibi cartoon avatar, big head, cute, simple background",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "webtoon",
    name: { en: "Webtoon", zh: "条漫韩漫" },
    description: { en: "Clean lines with soft shading in a webtoon style.", zh: "干净线条、柔和阴影的条漫风格。" },
    tags: ["webtoon", "clean"],
    sampleImage: "/style-packs/webtoon/sample.svg",
    isActive: true,
    promptTemplate: "webtoon style portrait, clean lines, soft shading, simple background",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "western-comic",
    name: { en: "Western Comic", zh: "美漫粗线" },
    description: { en: "Bold outlines and dramatic comic shading.", zh: "强轮廓、漫画质感，线条更有力量。" },
    tags: ["comic", "bold lines"],
    sampleImage: "/style-packs/western-comic/sample.svg",
    isActive: true,
    promptTemplate: "western comic portrait, bold outlines, dramatic shading, simple background",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "3d-toon",
    name: { en: "3D Toon", zh: "3D 卡通" },
    description: { en: "Soft lighting with a 3D animated look and depth.", zh: "柔和光照与立体质感，偏 3D 动画风。" },
    tags: ["3d", "toon"],
    sampleImage: "/style-packs/3d-toon/sample.svg",
    isActive: true,
    promptTemplate: "3d toon avatar portrait, soft lighting, smooth shading, simple background",
    negativePrompt: "low quality, blurry, deformed, uncanny, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "flat-vector",
    name: { en: "Flat Vector", zh: "扁平矢量" },
    description: { en: "Minimal geometric shapes with a clean brand feel.", zh: "几何简化、品牌感强，适合团队头像统一。" },
    tags: ["vector", "flat"],
    sampleImage: "/style-packs/flat-vector/sample.svg",
    isActive: true,
    promptTemplate: "flat vector avatar, minimal shapes, clean colors, simple background",
    negativePrompt: "photorealistic, texture, noise, low quality, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "pixel",
    name: { en: "Pixel Avatar", zh: "像素头像" },
    description: { en: "16/32-bit pixel art style, great for gaming communities.", zh: "16/32-bit 像素风，适合游戏与社群头像。" },
    tags: ["pixel", "retro"],
    sampleImage: "/style-packs/pixel/sample.svg",
    isActive: true,
    promptTemplate: "pixel art avatar portrait, 32-bit, simple background",
    negativePrompt: "low quality, blurry, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "watercolor",
    name: { en: "Watercolor", zh: "水彩插画" },
    description: { en: "Soft watercolor wash with paper texture and gentle blends.", zh: "纸纹与柔和晕染的水彩插画风。" },
    tags: ["watercolor", "illustration"],
    sampleImage: "/style-packs/watercolor/sample.svg",
    isActive: true,
    promptTemplate: "watercolor portrait illustration, paper texture, soft wash, simple background",
    negativePrompt: "low quality, muddy colors, blurry, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "clay",
    name: { en: "Clay Stop-motion", zh: "粘土定格" },
    description: { en: "Handcrafted clay texture with a stop-motion vibe.", zh: "粘土材质、手作感的定格动画风格。" },
    tags: ["clay", "stop motion"],
    sampleImage: "/style-packs/clay/sample.svg",
    isActive: true,
    promptTemplate: "clay stop motion avatar portrait, handcrafted texture, soft lighting, simple background",
    negativePrompt: "low quality, blurry, deformed, uncanny, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
] as const satisfies readonly StylePackBase[]

export type StylePack = (typeof stylePacks)[number]
export type StylePackId = StylePack["id"]

export function getActiveStylePacks(): StylePack[] {
  return stylePacks.filter((pack) => pack.isActive)
}

export function getStylePackById(id: string): StylePack | undefined {
  return stylePacks.find((pack) => pack.id === id)
}

export function getStylePackName(pack: StylePack, locale: Locale): string {
  return pack.name[locale]
}

export function getStylePackDescription(pack: StylePack, locale: Locale): string {
  return pack.description[locale]
}
