export const DEFAULT_SUPPORT_EMAIL = "panda@zltest.online"

export function getSupportEmail(): string {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()
  if (email && email.includes("@")) return email
  return DEFAULT_SUPPORT_EMAIL
}
