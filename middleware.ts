import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/locale"
import { updateSession } from "@/lib/supabase/middleware"
import { hasSupabaseEnv } from "@/lib/supabase/env"

const USER_ID_COOKIE = "zl_uid"

function getSupabaseProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  try {
    const host = new URL(url).hostname
    const [projectRef] = host.split(".")
    return projectRef || null
  } catch {
    return null
  }
}

function hasSupabaseAuthCookie(req: NextRequest): boolean {
  const projectRef = getSupabaseProjectRef()
  const prefix = projectRef ? `sb-${projectRef}-` : "sb-"
  return req.cookies.getAll().some((cookie) => cookie.name.startsWith(prefix))
}

function isRscRequest(req: NextRequest): boolean {
  return req.headers.get("rsc") === "1" || req.headers.get("next-router-prefetch") === "1"
}

export async function middleware(req: NextRequest) {
  if (isRscRequest(req)) {
    return NextResponse.next()
  }

  const existing = req.cookies.get(USER_ID_COOKIE)?.value
  const existingLocale = req.cookies.get(LOCALE_COOKIE)?.value

  const hasUid = Boolean(existing)
  const hasValidLocale = isLocale(existingLocale)

  const shouldUpdateSession = hasSupabaseEnv() && hasSupabaseAuthCookie(req)
  const res = shouldUpdateSession ? await updateSession(req) : NextResponse.next()

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
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)"],
}
