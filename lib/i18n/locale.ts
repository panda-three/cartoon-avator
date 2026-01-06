export const LOCALES = ["en", "zh"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

export const LOCALE_COOKIE = "zl_locale"

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value)
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export function localeToHtmlLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en"
}

export function localeToDateLocale(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en-US"
}

