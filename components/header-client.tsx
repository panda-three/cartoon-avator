"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Globe, LogOut, Menu, Sparkles, X } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "@/app/logout/actions"
import { loginWithGoogle } from "@/app/login/actions"

export type HeaderUser = {
  name: string
  email?: string | null
  avatarUrl?: string | null
}

type HeaderClientProps = {
  user: HeaderUser | null
}

function getInitials(label: string): string {
  const cleaned = label.trim()
  if (!cleaned) return "U"
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  const first = parts[0]?.[0] ?? ""
  const last = parts[parts.length - 1]?.[0] ?? ""
  return `${first}${last}`.toUpperCase()
}

function UserMenu({ user }: { user: HeaderUser }) {
  const { t } = useI18n()
  const displayName = user.name || user.email || t("header.account")
  const displayEmail = user.email ?? ""
  const initials = getInitials(displayName || displayEmail)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-2 py-1 text-sm text-foreground hover:bg-accent/60"
          type="button"
        >
          <Avatar className="size-8">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <span className="max-w-[140px] truncate">{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{displayName}</span>
              {displayEmail ? (
                <span className="text-xs text-muted-foreground">{displayEmail}</span>
              ) : null}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="size-4" />
              {t("header.logout")}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function HeaderClient({ user }: HeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [switchingLocale, setSwitchingLocale] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale, t } = useI18n()

  const toggleLocale = async () => {
    setSwitchingLocale(true)
    try {
      const nextLocale = locale === "en" ? "zh" : "en"
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      })
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSwitchingLocale(false)
    }
  }

  const toggleLabel = locale === "en" ? t("header.language.toggle.zh") : t("header.language.toggle.en")
  const query = searchParams.toString()
  const nextPath = `${pathname}${query ? `?${query}` : ""}`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">{t("app.name")}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#styles" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.styles")}
            </Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.pricing")}
            </Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.faq")}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={toggleLocale}
              disabled={switchingLocale}
            >
              <Globe className="mr-2 h-4 w-4" />
              {toggleLabel}
            </Button>
            {user ? (
              <UserMenu user={user} />
            ) : (
              <form action={loginWithGoogle}>
                <input type="hidden" name="next" value={nextPath} />
                <Button variant="ghost" className="text-foreground" type="submit">
                  {t("header.login")}
                </Button>
              </form>
            )}
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/create">{t("header.start")}</Link>
            </Button>
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="flex flex-col p-4 gap-4">
            <Link href="/#styles" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.styles")}
            </Link>
            <Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.pricing")}
            </Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("header.nav.faq")}
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={toggleLocale}
                disabled={switchingLocale}
              >
                <Globe className="mr-2 h-4 w-4" />
                {toggleLabel}
              </Button>
              {user ? (
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-semibold">
                        {getInitials(user.name || user.email || t("header.account"))}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {user.name || t("header.account")}
                      </span>
                      {user.email ? (
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      ) : null}
                    </div>
                  </div>
                  <form action={signOut}>
                    <Button variant="ghost" className="text-foreground" type="submit">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("header.logout")}
                    </Button>
                  </form>
                </div>
              ) : (
                <form action={loginWithGoogle}>
                  <input type="hidden" name="next" value={nextPath} />
                  <Button variant="ghost" className="w-full text-foreground" type="submit">
                    {t("header.login")}
                  </Button>
                </form>
              )}
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/create">{t("header.start")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
