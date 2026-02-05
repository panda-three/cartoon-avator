"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { useI18n } from "@/components/i18n-provider"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { BillingInterval } from "@/lib/pricing"

declare global {
  interface Window {
    paypal?: {
      Buttons?: (options: Record<string, unknown>) => {
        render: (container: HTMLElement) => Promise<void> | void
        close?: () => void
      }
    }
  }
}

const PAYPAL_SDK_EVENT = "paypal-sdk-loaded"

type PayPalCheckoutProps = {
  planId: string
  interval: BillingInterval
  className?: string
  onSuccess?: () => void
}

export function PayPalCheckout({ planId, interval, className, onSuccess }: PayPalCheckoutProps) {
  const { t } = useI18n()
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const currency = (process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? "USD").toUpperCase()
  const containerRef = useRef<HTMLDivElement>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)

  useEffect(() => {
    const handleReady = () => setSdkReady(true)

    if (window.paypal?.Buttons) {
      setSdkReady(true)
      return
    }

    window.addEventListener(PAYPAL_SDK_EVENT, handleReady)
    return () => {
      window.removeEventListener(PAYPAL_SDK_EVENT, handleReady)
    }
  }, [])

  useEffect(() => {
    if (!clientId) return
    if (!sdkReady) return
    if (!containerRef.current) return
    setError(null)
    if (!window.paypal?.Buttons) {
      setError(t("pricing.paypal.error.unavailable"))
      return
    }

    containerRef.current.innerHTML = ""
    setRendering(true)
    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", shape: "rect", label: "pay", tagline: false },
      createOrder: async () => {
        try {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, interval }),
          })
          const json = await res.json().catch(() => null)
          if (!res.ok) {
            const message = typeof json?.error === "string" ? json.error : t("pricing.paypal.error.create")
            throw new Error(message)
          }
          if (typeof json?.id !== "string") {
            throw new Error(t("pricing.paypal.error.create"))
          }
          return json.id
        } catch (err) {
          const message = err instanceof Error ? err.message : t("pricing.paypal.error.create")
          setError(message)
          throw err
        }
      },
      onApprove: async (data: { orderID?: string }) => {
        try {
          if (!data.orderID) throw new Error(t("pricing.paypal.error.capture"))
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID, planId, interval }),
          })
          const json = await res.json().catch(() => null)
          if (!res.ok) {
            const message = typeof json?.error === "string" ? json.error : t("pricing.paypal.error.capture")
            throw new Error(message)
          }
          setError(null)
          onSuccess?.()
        } catch (err) {
          const message = err instanceof Error ? err.message : t("pricing.paypal.error.capture")
          setError(message)
        }
      },
      onError: () => {
        setError(t("pricing.paypal.error.generic"))
      },
    })

    const renderResult = buttons.render(containerRef.current)
    Promise.resolve(renderResult)
      .catch(() => setError(t("pricing.paypal.error.generic")))
      .finally(() => setRendering(false))

    return () => {
      if (typeof buttons.close === "function") {
        try {
          buttons.close()
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }, [clientId, interval, onSuccess, planId, sdkReady, t])

  if (!clientId) {
    return <div className={cn("text-sm text-muted-foreground", className)}>{t("pricing.paypal.unconfigured")}</div>
  }

  const scriptSrc = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
    clientId,
  )}&currency=${currency}&intent=capture&components=buttons`

  return (
    <div className={cn("space-y-3", className)}>
      <Script
        id="paypal-sdk"
        src={scriptSrc}
        strategy="afterInteractive"
        onLoad={() => {
          setSdkReady(true)
          window.dispatchEvent(new Event(PAYPAL_SDK_EVENT))
        }}
        onError={() => setError(t("pricing.paypal.error.load"))}
      />
      {!sdkReady || rendering ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          <span>{t("pricing.paypal.loading")}</span>
        </div>
      ) : null}
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      <div ref={containerRef} />
    </div>
  )
}
