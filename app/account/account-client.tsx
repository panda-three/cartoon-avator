"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ExternalLink, RefreshCcw, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BillingPortalResponseSchema,
  BillingStatusResponseSchema,
  type BillingStatusResponse,
  type SubscriptionStatus,
} from "@/lib/billing"
import {
  DeleteJobResponseSchema,
  DeleteJobsResponseSchema,
  ListJobsResponseSchema,
  type JobPublic,
} from "@/lib/jobs"
import { getStylePackById } from "@/lib/style-packs"

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

function statusBadgeVariant(status: JobPublic["status"]): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "succeeded":
      return "default"
    case "queued":
    case "running":
      return "secondary"
    case "failed":
      return "destructive"
    case "canceled":
      return "outline"
  }
}

function statusLabel(status: JobPublic["status"]): string {
  switch (status) {
    case "queued":
      return "排队中"
    case "running":
      return "生成中"
    case "succeeded":
      return "已完成"
    case "failed":
      return "失败"
    case "canceled":
      return "已取消"
  }
}

async function fetchBillingStatus(): Promise<BillingStatusResponse> {
  const res = await fetch("/api/billing/status", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "获取订阅状态失败"
    throw new Error(message)
  }
  return BillingStatusResponseSchema.parse(json)
}

async function fetchJobs(): Promise<{ jobs: JobPublic[]; retentionDays: number }> {
  const res = await fetch("/api/jobs?limit=30", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "获取历史记录失败"
    throw new Error(message)
  }
  const parsed = ListJobsResponseSchema.parse(json)
  return { jobs: parsed.jobs, retentionDays: parsed.retentionDays }
}

async function fetchPortalUrl(): Promise<string | null> {
  const res = await fetch("/api/billing/portal", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "获取客户门户失败"
    throw new Error(message)
  }
  return BillingPortalResponseSchema.parse(json).portalUrl
}

async function deleteJob(jobId: string): Promise<void> {
  const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "删除失败"
    throw new Error(message)
  }
  DeleteJobResponseSchema.parse(json)
}

async function deleteAllJobs(): Promise<number> {
  const res = await fetch("/api/jobs", { method: "DELETE" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "删除失败"
    throw new Error(message)
  }
  return DeleteJobsResponseSchema.parse(json).deleted
}

export function AccountClient() {
  const [billing, setBilling] = useState<BillingStatusResponse | null>(null)
  const [jobs, setJobs] = useState<JobPublic[]>([])
  const [retentionDays, setRetentionDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [deleteAllLoading, setDeleteAllLoading] = useState(false)

  const subscriptionStatus = billing?.subscription?.status ?? "inactive"
  const quota = billing?.usage

  const canOpenPortal = useMemo(() => {
    if (!billing?.subscription) return false
    return billing.subscription.provider === "creem"
  }, [billing])

  const load = useCallback(async () => {
    setError(null)
    const [nextBilling, nextJobs] = await Promise.all([fetchBillingStatus(), fetchJobs()])
    setBilling(nextBilling)
    setJobs(nextJobs.jobs)
    setRetentionDays(nextJobs.retentionDays)
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "加载失败")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [load])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "刷新失败")
    } finally {
      setRefreshing(false)
    }
  }

  const onOpenPortal = async () => {
    setPortalLoading(true)
    setError(null)
    try {
      const url = await fetchPortalUrl()
      if (!url) {
        throw new Error("未配置客户门户入口（请设置 CREEM_CUSTOMER_PORTAL_URL 或使用 Creem API 创建门户链接）")
      }
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      setError(err instanceof Error ? err.message : "打开客户门户失败")
    } finally {
      setPortalLoading(false)
    }
  }

  const onDelete = async (jobId: string) => {
    setDeleteLoadingId(jobId)
    setError(null)
    try {
      await deleteJob(jobId)
      setJobs((prev) => prev.filter((job) => job.id !== jobId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败")
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const onDeleteAll = async () => {
    setDeleteAllLoading(true)
    setError(null)
    try {
      await deleteAllJobs()
      setJobs([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败")
    } finally {
      setDeleteAllLoading(false)
    }
  }

  const rows = useMemo(() => {
    return jobs.map((job) => {
      const pack = getStylePackById(job.stylePackId)
      const createdAtMs = Date.parse(job.createdAt)
      const createdAt = Number.isFinite(createdAtMs) ? new Date(createdAtMs) : null
      const expiresAt = createdAt ? new Date(createdAt.getTime() + retentionDays * 24 * 60 * 60 * 1000) : null

      return {
        job,
        packName: pack?.name ?? job.stylePackId,
        createdAtLabel: createdAt ? createdAt.toLocaleString() : job.createdAt,
        expiresAtLabel: expiresAt ? expiresAt.toLocaleDateString() : null,
      }
    })
  }, [jobs, retentionDays])

  return (
    <div className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>操作失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>订阅状态</CardTitle>
            <CardDescription>订阅有效且额度充足时可创建任务</CardDescription>
            <CardAction className="flex gap-2">
              {subscriptionStatus === "inactive" || subscriptionStatus === "expired" || subscriptionStatus === "past_due" ? (
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/pricing">前往订阅</Link>
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent"
                onClick={onOpenPortal}
                disabled={!canOpenPortal || portalLoading}
              >
                {portalLoading ? <Spinner className="mr-2" /> : <ExternalLink className="mr-2 size-4" />}
                客户门户
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>正在获取订阅状态…</span>
              </div>
            ) : (
              <>
                <div>
                  当前状态：<span className="text-foreground">{subscriptionLabel(subscriptionStatus)}</span>
                </div>
                {billing?.subscription?.currentPeriodEnd ? (
                  <div>到期时间：{new Date(billing.subscription.currentPeriodEnd).toLocaleString()}</div>
                ) : null}
                {billing?.activeJobId ? (
                  <div>
                    进行中任务：{" "}
                    <Link href={`/jobs/${billing.activeJobId}`} className="underline text-foreground">
                      {billing.activeJobId}
                    </Link>
                  </div>
                ) : null}
                {!canOpenPortal ? <div>提示：mock 订阅或未接入 Creem 时无客户门户入口。</div> : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>当月额度</CardTitle>
            <CardDescription>生成成功后扣减；失败不扣</CardDescription>
            <CardAction>
              <Button size="sm" variant="outline" className="bg-transparent" asChild>
                <Link href="/create">去创建</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>正在获取额度信息…</span>
              </div>
            ) : quota ? (
              <>
                <div>月份：{quota.month}</div>
                <div>
                  使用：<span className="text-foreground">{quota.quotaUsed}</span> / {quota.quotaTotal}（剩余{" "}
                  <span className="text-foreground">{quota.quotaRemaining}</span>）
                </div>
                {billing?.canCreateJob ? null : (
                  <div className="text-destructive">{billing?.createBlockedReason ?? "暂不可创建任务"}</div>
                )}
              </>
            ) : (
              <div>暂无额度信息</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>历史记录</CardTitle>
          <CardDescription>最近 30 次任务，默认保存 {retentionDays} 天（到期自动清理）</CardDescription>
          <CardAction className="flex gap-2">
            <Button size="sm" variant="outline" className="bg-transparent" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? <Spinner className="mr-2" /> : <RefreshCcw className="mr-2 size-4" />}
              刷新
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={!jobs.length || deleteAllLoading}>
                  {deleteAllLoading ? <Spinner className="mr-2" /> : <Trash2 className="mr-2 size-4" />}
                  删除全部
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除全部历史记录？</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="text-sm text-muted-foreground">
                  将删除你的上传原图与生成结果（删除后不可再访问）。
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteAll}>确认删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              <span>正在加载历史记录…</span>
            </div>
          ) : !rows.length ? (
            <div className="text-sm text-muted-foreground">暂无历史记录</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>风格包</TableHead>
                  <TableHead>结果下载</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ job, packName, createdAtLabel, expiresAtLabel }) => (
                  <TableRow key={job.id}>
                    <TableCell className="text-muted-foreground">
                      <div>{createdAtLabel}</div>
                      {expiresAtLabel ? <div className="text-xs">到期：{expiresAtLabel}</div> : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(job.status)}>{statusLabel(job.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{packName}</TableCell>
                    <TableCell>
                      {job.status === "succeeded" && job.outputImageUrls.length ? (
                        <div className="flex flex-wrap gap-2">
                          {job.outputImageUrls.slice(0, 4).map((url, idx) => (
                            <Button key={`${job.id}-${idx}`} size="sm" variant="outline" className="bg-transparent" asChild>
                              <a href={url} download={`avatar-${job.id}-${idx + 1}.png`}>
                                #{idx + 1}
                              </a>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent" asChild>
                          <Link href={`/jobs/${job.id}`}>查看</Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" disabled={deleteLoadingId === job.id}>
                              {deleteLoadingId === job.id ? <Spinner className="mr-2" /> : <Trash2 className="mr-2 size-4" />}
                              删除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除该任务？</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="text-sm text-muted-foreground">
                              将删除上传原图与生成结果（删除后不可再访问）。
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(job.id)}>确认删除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

