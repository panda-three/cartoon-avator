import "server-only"

import { cookies } from "next/headers"

const USER_ID_COOKIE = "zl_uid"

export async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(USER_ID_COOKIE)?.value ?? null
}
