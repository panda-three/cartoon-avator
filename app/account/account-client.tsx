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
import { useI18n } from "@/components/i18n-provider"
import {
  BillingPortalResponseSchema,
  BillingStatusResponseSchema,
  type BillingStatusResponse,
  type SubscriptionStatus,
} from "@/lib/billing"
import { localeToDateLocale } from "@/lib/i18n/locale"
import {
  DeleteJobResponseSchema,
  DeleteJobsResponseSchema,
  ListJobsResponseSchema,
  type JobPublic,
} from "@/lib/jobs"
import { getStylePackById, getStylePackName } from "@/lib/style-packs"

function subscriptionLabel(status: SubscriptionStatus, t: (key: any) => string) {
  switch (status) {
    case "active":
      return t("billing.subscription.active")
    case "canceled":
      return t("billing.subscription.canceled")
    case "past_due":
      return t("billing.subscription.past_due")
    case "expired":
      return t("billing.subscription.expired")
    case "inactive":
      return t("billing.subscription.inactive")
    default:
      return t("billing.subscription.inactive")
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

function statusLabel(status: JobPublic["status"], t: (key: any) => string): string {
  switch (status) {
    case "queued":
      return t("status.queued")
    case "running":
      return t("status.running")
    case "succeeded":
      return t("status.succeeded")
    case "failed":
      return t("status.failed")
    case "canceled":
      return t("status.canceled")
  }
}

async function fetchBillingStatus(opts: { fallbackErrorMessage: string }): Promise<BillingStatusResponse> {
  const res = await fetch("/api/billing/status", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : opts.fallbackErrorMessage
    throw new Error(message)
  }
  return BillingStatusResponseSchema.parse(json)
}

async function fetchJobs(opts: { fallbackErrorMessage: string }): Promise<{ jobs: JobPublic[]; retentionDays: number }> {
  const res = await fetch("/api/jobs?limit=30", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : opts.fallbackErrorMessage
    throw new Error(message)
  }
  const parsed = ListJobsResponseSchema.parse(json)
  return { jobs: parsed.jobs, retentionDays: parsed.retentionDays }
}

async function fetchPortalUrl(opts: { fallbackErrorMessage: string }): Promise<string | null> {
  const res = await fetch("/api/billing/portal", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : opts.fallbackErrorMessage
    throw new Error(message)
  }
  return BillingPortalResponseSchema.parse(json).portalUrl
}

async function deleteJob(jobId: string, opts: { fallbackErrorMessage: string }): Promise<void> {
  const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : opts.fallbackErrorMessage
    throw new Error(message)
  }
  DeleteJobResponseSchema.parse(json)
}

async function deleteAllJobs(opts: { fallbackErrorMessage: string }): Promise<number> {
  const res = await fetch("/api/jobs", { method: "DELETE" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : opts.fallbackErrorMessage
    throw new Error(message)
  }
  return DeleteJobsResponseSchema.parse(json).deleted
}

export function AccountClient() {
  const { locale, t } = useI18n()
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
  const dateLocale = localeToDateLocale(locale)

  const canOpenPortal = useMemo(() => {
    if (!billing?.subscription) return false
    return billing.subscription.provider === "creem"
  }, [billing])

  const load = useCallback(async () => {
    setError(null)
    const [nextBilling, nextJobs] = await Promise.all([
      fetchBillingStatus({ fallbackErrorMessage: t("pricing.client.error.fetchFailed") }),
      fetchJobs({ fallbackErrorMessage: t("account.history.error.fetchFailed") }),
    ])
    setBilling(nextBilling)
    setJobs(nextJobs.jobs)
    setRetentionDays(nextJobs.retentionDays)
  }, [t])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : t("common.error.loadFailed"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [load, t])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error.refreshFailed"))
    } finally {
      setRefreshing(false)
    }
  }

  const onOpenPortal = async () => {
    setPortalLoading(true)
    setError(null)
    try {
      const url = await fetchPortalUrl({ fallbackErrorMessage: t("account.subscription.error.portalFetchFailed") })
      if (!url) {
        throw new Error(t("account.subscription.portalMissing"))
      }
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error.openPortalFailed"))
    } finally {
      setPortalLoading(false)
    }
  }

  const onDelete = async (jobId: string) => {
    setDeleteLoadingId(jobId)
    setError(null)
    try {
      await deleteJob(jobId, { fallbackErrorMessage: t("common.error.deleteFailed") })
      setJobs((prev) => prev.filter((job) => job.id !== jobId))
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error.deleteFailed"))
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const onDeleteAll = async () => {
    setDeleteAllLoading(true)
    setError(null)
    try {
      await deleteAllJobs({ fallbackErrorMessage: t("common.error.deleteFailed") })
      setJobs([])
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error.deleteFailed"))
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
        packName: pack ? getStylePackName(pack, locale) : job.stylePackId,
        createdAtLabel: createdAt ? createdAt.toLocaleString(dateLocale) : job.createdAt,
        expiresAtLabel: expiresAt ? expiresAt.toLocaleDateString(dateLocale) : null,
      }
    })
  }, [dateLocale, jobs, locale, retentionDays])

  return (
    <div className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{t("account.alert.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("account.subscription.title")}</CardTitle>
            <CardDescription>{t("account.subscription.subtitle")}</CardDescription>
            <CardAction className="flex gap-2">
              {subscriptionStatus === "inactive" || subscriptionStatus === "expired" || subscriptionStatus === "past_due" ? (
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/pricing">{t("account.cta.pricing")}</Link>
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
                {t("account.subscription.portal")}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>{t("account.subscription.loading")}</span>
              </div>
            ) : (
              <>
                <div>
                  {t("account.subscription.status", { status: subscriptionLabel(subscriptionStatus, t) })}
                </div>
                {billing?.subscription?.currentPeriodEnd ? (
                  <div>
                    {t("account.subscription.periodEnd", {
                      time: new Date(billing.subscription.currentPeriodEnd).toLocaleString(dateLocale),
                    })}
                  </div>
                ) : null}
                {billing?.activeJobId ? (
                  <div>
                    {t("account.subscription.activeJobLabel")}{" "}
                    <Link href={`/jobs/${billing.activeJobId}`} className="underline text-foreground">
                      {billing.activeJobId}
                    </Link>
                  </div>
                ) : null}
                {!canOpenPortal ? <div>{t("account.subscription.portalHint")}</div> : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("account.quota.title")}</CardTitle>
            <CardDescription>{t("account.quota.subtitle")}</CardDescription>
            <CardAction>
              <Button size="sm" variant="outline" className="bg-transparent" asChild>
                <Link href="/create">{t("common.goCreate")}</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>{t("account.quota.loading")}</span>
              </div>
            ) : quota ? (
              <>
                <div>{t("account.quota.month", { month: quota.month })}</div>
                <div>
                  {t("account.quota.usage", {
                    used: quota.quotaUsed,
                    total: quota.quotaTotal,
                    remaining: quota.quotaRemaining,
                  })}
                </div>
                {billing?.canCreateJob ? null : (
                  <div className="text-destructive">{billing?.createBlockedReason ?? t("account.quota.blocked")}</div>
                )}
              </>
            ) : (
              <div>{t("account.quota.none")}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("account.history.title")}</CardTitle>
          <CardDescription>{t("account.history.subtitle", { days: retentionDays })}</CardDescription>
          <CardAction className="flex gap-2">
            <Button size="sm" variant="outline" className="bg-transparent" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? <Spinner className="mr-2" /> : <RefreshCcw className="mr-2 size-4" />}
              {t("account.history.refresh")}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={!jobs.length || deleteAllLoading}>
                  {deleteAllLoading ? <Spinner className="mr-2" /> : <Trash2 className="mr-2 size-4" />}
                  {t("account.history.deleteAll")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("account.history.deleteAll.confirmTitle")}</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="text-sm text-muted-foreground">
                  {t("account.history.deleteAll.confirmBody")}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteAll}>{t("common.confirmDelete")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              <span>{t("account.history.loading")}</span>
            </div>
          ) : !rows.length ? (
            <div className="text-sm text-muted-foreground">{t("account.history.none")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("account.history.table.time")}</TableHead>
                  <TableHead>{t("account.history.table.status")}</TableHead>
                  <TableHead>{t("account.history.table.style")}</TableHead>
                  <TableHead>{t("account.history.table.download")}</TableHead>
                  <TableHead>{t("account.history.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ job, packName, createdAtLabel, expiresAtLabel }) => (
                  <TableRow key={job.id}>
                    <TableCell className="text-muted-foreground">
                      <div>{createdAtLabel}</div>
                      {expiresAtLabel ? (
                        <div className="text-xs">{t("account.history.expires", { date: expiresAtLabel })}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(job.status)}>{statusLabel(job.status, t)}</Badge>
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
                          <Link href={`/jobs/${job.id}`}>{t("account.history.view")}</Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" disabled={deleteLoadingId === job.id}>
                              {deleteLoadingId === job.id ? <Spinner className="mr-2" /> : <Trash2 className="mr-2 size-4" />}
                              {t("account.history.delete")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("account.history.delete.confirmTitle")}</AlertDialogTitle>
                            </AlertDialogHeader>
                            <div className="text-sm text-muted-foreground">
                              {t("account.history.delete.confirmBody")}
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(job.id)}>{t("common.confirmDelete")}</AlertDialogAction>
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
