import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseKey, getSupabaseUrl } from '@/lib/supabase/env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims ?? null

  if (
    !claims &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially redirect to login if strictly protected
    // BUT since the site seems to have public pages, we might not want to redirect everyone.
    // The user's request is specifically about "Google Login", not "Protect the whole site".
    // So I will NOT force redirect here for now, unless requested.
    // However, I MUST return the response with cookies set.
  }

  return supabaseResponse
}
