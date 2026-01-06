"use client"

import { createContext, useContext, useMemo } from "react"
import type React from "react"
import type { Locale } from "@/lib/i18n/locale"
import { formatMessage, messagesEn, type MessageKey, type MessageVars, type Messages } from "@/lib/i18n/messages"

type I18nContextValue = {
  locale: Locale
  messages: Messages
  t: (key: MessageKey, vars?: MessageVars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: React.ReactNode
}) {
  const value = useMemo<I18nContextValue>(() => {
    const t = (key: MessageKey, vars?: MessageVars) => {
      const template = messages[key] ?? (messagesEn as Messages)[key] ?? key
      return formatMessage(template, vars)
    }

    return { locale, messages, t }
  }, [locale, messages])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}

