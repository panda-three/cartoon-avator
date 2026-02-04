import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/locale"
import { updateSession } from "@/lib/supabase/middleware"
import { hasSupabaseEnv } from "@/lib/supabase/env"

const USER_ID_COOKIE = "zl_uid"

export async function middleware(req: NextRequest) {
  const existing = req.cookies.get(USER_ID_COOKIE)?.value
  const existingLocale = req.cookies.get(LOCALE_COOKIE)?.value

  const hasUid = Boolean(existing)
  const hasValidLocale = isLocale(existingLocale)

  const res = hasSupabaseEnv() ? await updateSession(req) : NextResponse.next()

  if (!hasUid) {
    res.cookies.set({
      name: USER_ID_COOKIE,
      value: `usr_${crypto.randomUUID()}`,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  }

  if (!hasValidLocale) {
    res.cookies.set({
      name: LOCALE_COOKIE,
      value: DEFAULT_LOCALE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
