"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  BillingCheckoutResponseSchema,
  BillingStatusResponseSchema,
  type BillingStatusResponse,
  type SubscriptionStatus,
} from "@/lib/billing"

function subscriptionLabel(status: SubscriptionStatus) {
  switch (status) {
    case "active":
      return "已订阅（有效）"
    case "canceled":
      return "已取消（到期前仍可用）"
    case "past_due":
      return "扣款失败/已暂停"
    case "expired":
      return "已过期"
    case "inactive":
      return "未订阅"
    default:
      return "未订阅"
  }
}

async function fetchStatus(): Promise<BillingStatusResponse> {
  const res = await fetch("/api/billing/status", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "获取订阅状态失败"
    throw new Error(message)
  }
  return BillingStatusResponseSchema.parse(json)
}

export function PricingClient() {
  const [status, setStatus] = useState<BillingStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const next = await fetchStatus()
        if (cancelled) return
        setStatus(next)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "获取订阅状态失败")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const onSubscribe = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "monthly" }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const message = typeof json?.error === "string" ? json.error : "创建订阅失败"
        throw new Error(message)
      }

      const parsed = BillingCheckoutResponseSchema.parse(json)
      if (parsed.checkoutUrl) {
        window.location.href = parsed.checkoutUrl
        return
      }

      const next = await fetchStatus()
      setStatus(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建订阅失败")
    } finally {
      setActionLoading(false)
    }
  }

  const subscriptionStatus = status?.subscription?.status ?? "inactive"
  const quota = status?.usage

  const showSubscribe = subscriptionStatus === "inactive" || subscriptionStatus === "expired" || subscriptionStatus === "past_due"

  return (
    <div className="pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>订阅入口</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>正在获取订阅状态…</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  当前状态：<span className="text-foreground">{subscriptionLabel(subscriptionStatus)}</span>
                </div>
                {status?.subscription?.currentPeriodEnd ? (
                  <div>到期时间：{new Date(status.subscription.currentPeriodEnd).toLocaleString()}</div>
                ) : null}
                {quota ? (
                  <div>
                    本月额度：{quota.quotaUsed}/{quota.quotaTotal}（剩余 {quota.quotaRemaining}）
                  </div>
                ) : null}
                {status?.activeJobId ? (
                  <div>
                    进行中任务：<Link href={`/jobs/${status.activeJobId}`}>{status.activeJobId}</Link>
                  </div>
                ) : null}
              </div>
            )}

            {error ? <div className="text-destructive">{error}</div> : null}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={onSubscribe}
                disabled={!showSubscribe || actionLoading}
              >
                {actionLoading ? <Spinner className="mr-2" /> : null}
                {showSubscribe ? "开通订阅" : "已订阅"}
              </Button>

              <Button variant="outline" className="bg-transparent" asChild>
                <Link href="/create">去创建页</Link>
              </Button>
            </div>

            <div className="text-xs">
              未配置 Creem 时将使用 mock 订阅（设置 `CREEM_API_KEY` + `CREEM_WEBHOOK_SECRET` + `CREEM_PRODUCT_ID` 可接入真实流程）。
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
