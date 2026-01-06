import { NextResponse } from "next/server"
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/locale"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const raw = typeof body?.locale === "string" ? body.locale : null
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE

  const res = NextResponse.json({ ok: true, locale })
  res.cookies.set({
    name: LOCALE_COOKIE,
    value: locale,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
