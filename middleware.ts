import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/locale"

const USER_ID_COOKIE = "zl_uid"

export function middleware(req: NextRequest) {
  const existing = req.cookies.get(USER_ID_COOKIE)?.value
  const existingLocale = req.cookies.get(LOCALE_COOKIE)?.value

  const hasUid = Boolean(existing)
  const hasValidLocale = isLocale(existingLocale)

  if (hasUid && hasValidLocale) return NextResponse.next()

  const res = NextResponse.next()

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
