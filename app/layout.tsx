import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { cookies } from "next/headers"
import { I18nProvider } from "@/components/i18n-provider"
import { getMessages } from "@/lib/i18n/messages"
import { LOCALE_COOKIE, localeToHtmlLang, normalizeLocale } from "@/lib/i18n/locale"
import "./globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const messages = getMessages(locale)

  return {
    title: messages["meta.title"],
    description: messages["meta.description"],
    generator: "v0.app",
    icons: {
      icon: [
        {
          url: "/icon-light-32x32.png",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/icon-dark-32x32.png",
          media: "(prefers-color-scheme: dark)",
        },
        {
          url: "/icon.svg",
          type: "image/svg+xml",
        },
      ],
      apple: "/apple-icon.png",
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const messages = getMessages(locale)

  return (
    <html lang={localeToHtmlLang(locale)} className="dark">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-73KTT5BHHZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-73KTT5BHHZ');`}
        </Script>
      </head>
      <body className={`font-sans antialiased`}>
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
