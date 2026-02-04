"use client"

import { useEffect, useState } from "react"
import { HeaderClient, type HeaderUser } from "@/components/header-client"

export function Header() {
  const [user, setUser] = useState<HeaderUser | null>(null)

  useEffect(() => {
    let isActive = true

    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/user", { cache: "no-store" })
        if (!res.ok) return
        const payload = (await res.json()) as { user?: HeaderUser | null }
        if (isActive) {
          setUser(payload.user ?? null)
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadUser()
    return () => {
      isActive = false
    }
  }, [])

  return <HeaderClient user={user} />
}
