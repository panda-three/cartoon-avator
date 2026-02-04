export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
}

export function getSupabaseKey(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ]

  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }

  return ""
}

export function hasSupabaseEnv(): boolean {
  return Boolean(getSupabaseUrl()) && Boolean(getSupabaseKey())
}
