type StylePackBase = {
  id: string
  name: string
  description: string
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
    name: "日漫清线",
    description: "线稿清晰、轻上色，适合头像与社交头像。",
    tags: ["anime", "line"],
    sampleImage: "/style-packs/anime-line/sample.svg",
    isActive: true,
    promptTemplate: "cartoon avatar portrait, clean lineart, soft colors, simple background",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "anime-cel",
    name: "日漫赛璐璐",
    description: "高对比、色块分明的赛璐璐上色风格。",
    tags: ["anime", "cel"],
    sampleImage: "/style-packs/anime-cel/sample.svg",
    isActive: true,
    promptTemplate: "cartoon avatar portrait, cel shading, high contrast, clean edges",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "chibi",
    name: "Q 版大头",
    description: "可爱夸张比例，更适合头像场景。",
    tags: ["chibi", "cute"],
    sampleImage: "/style-packs/chibi/sample.svg",
    isActive: true,
    promptTemplate: "chibi cartoon avatar, big head, cute, simple background",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "webtoon",
    name: "条漫韩漫",
    description: "干净线条、柔和阴影的条漫风格。",
    tags: ["webtoon", "clean"],
    sampleImage: "/style-packs/webtoon/sample.svg",
    isActive: true,
    promptTemplate: "webtoon style portrait, clean lines, soft shading, simple background",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "western-comic",
    name: "美漫粗线",
    description: "强轮廓、漫画质感，线条更有力量。",
    tags: ["comic", "bold lines"],
    sampleImage: "/style-packs/western-comic/sample.svg",
    isActive: true,
    promptTemplate: "western comic portrait, bold outlines, dramatic shading, simple background",
    negativePrompt: "low quality, blurry, deformed, extra fingers, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "3d-toon",
    name: "3D 卡通",
    description: "柔和光照与立体质感，偏 3D 动画风。",
    tags: ["3d", "toon"],
    sampleImage: "/style-packs/3d-toon/sample.svg",
    isActive: true,
    promptTemplate: "3d toon avatar portrait, soft lighting, smooth shading, simple background",
    negativePrompt: "low quality, blurry, deformed, uncanny, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "flat-vector",
    name: "扁平矢量",
    description: "几何简化、品牌感强，适合团队头像统一。",
    tags: ["vector", "flat"],
    sampleImage: "/style-packs/flat-vector/sample.svg",
    isActive: true,
    promptTemplate: "flat vector avatar, minimal shapes, clean colors, simple background",
    negativePrompt: "photorealistic, texture, noise, low quality, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "pixel",
    name: "像素头像",
    description: "16/32-bit 像素风，适合游戏与社群头像。",
    tags: ["pixel", "retro"],
    sampleImage: "/style-packs/pixel/sample.svg",
    isActive: true,
    promptTemplate: "pixel art avatar portrait, 32-bit, simple background",
    negativePrompt: "low quality, blurry, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "watercolor",
    name: "水彩插画",
    description: "纸纹与柔和晕染的水彩插画风。",
    tags: ["watercolor", "illustration"],
    sampleImage: "/style-packs/watercolor/sample.svg",
    isActive: true,
    promptTemplate: "watercolor portrait illustration, paper texture, soft wash, simple background",
    negativePrompt: "low quality, muddy colors, blurry, text, watermark",
    recommended: { aspectRatio: "1:1", imageSize: "1K" },
  },
  {
    id: "clay",
    name: "粘土定格",
    description: "粘土材质、手作感的定格动画风格。",
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
