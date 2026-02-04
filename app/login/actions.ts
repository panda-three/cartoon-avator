'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

function normalizeNextPath(raw: FormDataEntryValue | null): string {
  if (typeof raw !== 'string') return '/create'
  if (!raw.startsWith('/')) return '/create'
  if (raw.startsWith('//')) return '/create'
  return raw
}

async function getRequestOrigin(): Promise<string | null> {
  const headerList = await headers()
  const origin = headerList.get('origin')
  if (origin) return origin

  const forwardedHost = headerList.get('x-forwarded-host')
  const host = forwardedHost ?? headerList.get('host')
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL ?? null

  const proto =
    headerList.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https')

  return `${proto}://${host}`
}

export async function loginWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const origin = await getRequestOrigin()
  const next = normalizeNextPath(formData.get('next'))

  if (!origin) {
    redirect('/auth/auth-code-error')
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    console.error(error)
    redirect('/auth/auth-code-error')
  }

  if (data.url) {
    redirect(data.url)
  }

  redirect('/auth/auth-code-error')
}
