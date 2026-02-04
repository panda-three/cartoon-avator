import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { hasSupabaseEnv } from "@/lib/supabase/env"

export const dynamic = "force-dynamic"

type HeaderUser = {
  name: string
  email?: string | null
  avatarUrl?: string | null
}

function resolveDisplayName(user: User): string {
  const metadata = user.user_metadata as Record<string, unknown> | null
  const candidates = [
    metadata?.full_name,
    metadata?.name,
    metadata?.preferred_username,
    user.email,
  ]
  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return ""
}

function resolveAvatarUrl(user: User): string | null {
  const metadata = user.user_metadata as Record<string, unknown> | null
  const candidates = [metadata?.avatar_url, metadata?.picture]
  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return null
}

function toHeaderUser(user: User): HeaderUser {
  return {
    name: resolveDisplayName(user),
    email: user.email,
    avatarUrl: resolveAvatarUrl(user),
  }
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  return NextResponse.json({ user: toHeaderUser(user) }, { status: 200 })
}
