import { NextResponse, type NextRequest } from "next/server"

const USER_ID_COOKIE = "zl_uid"

export function middleware(req: NextRequest) {
  const existing = req.cookies.get(USER_ID_COOKIE)?.value
  if (existing) return NextResponse.next()

  const res = NextResponse.next()
  res.cookies.set({
    name: USER_ID_COOKIE,
    value: `usr_${crypto.randomUUID()}`,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}

