"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Clock, RefreshCcw, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { useI18n } from "@/components/i18n-provider"
import { GetJobResponseSchema, type JobPublic, type JobStatus } from "@/lib/jobs"
import { getStylePackById, getStylePackName } from "@/lib/style-packs"

type Props = {
  jobId: string
}

async function fetchJob(jobId: string, opts: { fallbackErrorMessage: string }): Promise<JobPublic> {
  const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : opts.fallbackErrorMessage
    throw new Error(message)
  }
  return GetJobResponseSchema.parse(json).job
}

export function JobClient({ jobId }: Props) {
  const { locale, t } = useI18n()
  const router = useRouter()

  const [job, setJob] = useState<JobPublic | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<"retry" | "cancel" | "clone" | null>(null)

  const pack = useMemo(() => (job ? getStylePackById(job.stylePackId) : undefined), [job])
  const packName = pack ? getStylePackName(pack, locale) : job?.stylePackId ?? "-"

  const refresh = useCallback(async () => {
    const data = await fetchJob(jobId, { fallbackErrorMessage: t("job.error.fetchFailed") })
    setJob(data)
    setError(null)
  }, [jobId, t])

  useEffect(() => {
    let cancelled = false
    let timer: number | null = null

    const tick = async () => {
      try {
        const data = await fetchJob(jobId, { fallbackErrorMessage: t("job.error.fetchFailed") })
        if (cancelled) return
        setJob(data)
        setError(null)
        setLoading(false)

        if (data.status === "queued" || data.status === "running") {
          timer = window.setTimeout(tick, 2000)
        }
      } catch (err) {
        if (cancelled) return
        setLoading(false)
        setError(err instanceof Error ? err.message : t("job.error.fetchFailed"))
        timer = window.setTimeout(tick, 3000)
      }
    }

    void tick()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [jobId, t])

  const onRetry = async () => {
    setActionLoading("retry")
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const message = typeof json?.error === "string" ? json.error : t("job.error.retryFailed")
        throw new Error(message)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("job.error.retryFailed"))
    } finally {
      setActionLoading(null)
    }
  }

  const onCancel = async () => {
    setActionLoading("cancel")
    try {
      const res = await fetch(`/api/jobs/${jobId}/cancel`, { method: "POST" })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const message = typeof json?.error === "string" ? json.error : t("job.error.cancelFailed")
        throw new Error(message)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("job.error.cancelFailed"))
    } finally {
      setActionLoading(null)
    }
  }

  const onClone = async () => {
    setActionLoading("clone")
    try {
      const res = await fetch(`/api/jobs/${jobId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const message = typeof json?.error === "string" ? json.error : t("job.error.cloneFailed")
        throw new Error(message)
      }
      const nextJobId = typeof json?.jobId === "string" ? json.jobId : null
      if (!nextJobId) throw new Error(t("job.error.cloneFailed"))
      router.push(`/jobs/${nextJobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("job.error.cloneFailed"))
    } finally {
      setActionLoading(null)
    }
  }

  const status = job?.status ?? "queued"
  const meta = (() => {
    switch (status) {
      case "queued":
        return { label: t("status.queued"), icon: Clock }
      case "running":
        return { label: t("status.running"), icon: Spinner }
      case "succeeded":
        return { label: t("status.succeeded"), icon: CheckCircle2 }
      case "failed":
        return { label: t("status.failed"), icon: AlertCircle }
      case "canceled":
        return { label: t("status.canceled"), icon: XCircle }
    }
  })()
  const StatusIcon = meta.icon

  const adjustHref =
    job && pack
      ? `/create?fromJob=${encodeURIComponent(job.id)}&style=${encodeURIComponent(pack.id)}&identityStrength=${job.params.identityStrength}`
      : `/create?fromJob=${encodeURIComponent(jobId)}`

  return (
    <div className="space-y-6">
      {job?.provider === "mock" ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("job.mock.title")}</AlertTitle>
          <AlertDescription>
            <p>{t("job.mock.body")}</p>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("job.status.title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div className="flex items-center gap-2">
            {StatusIcon === Spinner ? <Spinner className="size-4" /> : <StatusIcon className="size-4" />}
            <span className="text-foreground font-medium">{meta.label}</span>
            {job ? (
              <span className="text-xs text-muted-foreground">{t("job.status.attempt", { attempt: job.attempt })}</span>
            ) : null}
            {job?.provider === "mock" ? <span className="text-xs text-muted-foreground">mock</span> : null}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>{t("job.status.pack", { name: packName })}</div>
            <div>{job ? t("job.status.identity", { pct: job.params.identityStrength }) : "-"}</div>
          </div>

          {job?.status === "failed" ? (
            <div className="text-destructive">{job.error?.message ?? t("job.status.failed")}</div>
          ) : null}
          {job?.status === "canceled" ? <div>{t("job.status.canceled")}</div> : null}
          {loading ? <div>{t("common.loading")}</div> : null}
          {error ? <div className="text-destructive">{error}</div> : null}
        </CardContent>
      </Card>

      {job?.status === "succeeded" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("job.result.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              {job.outputImageUrls.map((url, idx) => (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  className="group rounded-2xl overflow-hidden border border-border bg-secondary"
                  onClick={() => setSelectedImageUrl(url)}
                >
                  <img
                    src={url}
                    alt={t("job.result.alt", { index: idx + 1 })}
                    className="w-full h-full aspect-square object-cover transition-transform group-hover:scale-[1.02]"
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={onClone}
                disabled={actionLoading === "clone"}
              >
                {actionLoading === "clone" ? <Spinner className="mr-2" /> : <RefreshCcw className="mr-2 size-4" />}
                {t("job.actions.clone")}
              </Button>
              <Button variant="outline" className="bg-transparent" asChild>
                <Link href={adjustHref}>{t("job.actions.adjust")}</Link>
              </Button>
              <Button variant="outline" className="bg-transparent" asChild>
                <Link href="/">{t("job.actions.backHome")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {job?.status === "failed" ? (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onRetry}
            disabled={actionLoading === "retry"}
          >
            {actionLoading === "retry" ? <Spinner className="mr-2" /> : <RefreshCcw className="mr-2 size-4" />}
            {t("job.actions.retry")}
          </Button>
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href={adjustHref}>{t("job.actions.adjust")}</Link>
          </Button>
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href="/">{t("job.actions.backHome")}</Link>
          </Button>
        </div>
      ) : null}

      {job?.status === "queued" || job?.status === "running" ? (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button variant="outline" className="bg-transparent" onClick={onCancel} disabled={actionLoading === "cancel"}>
            {actionLoading === "cancel" ? <Spinner className="mr-2" /> : null}
            {t("job.actions.cancel")}
          </Button>
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href="/create">{t("job.actions.backCreate")}</Link>
          </Button>
        </div>
      ) : null}

      <Dialog open={Boolean(selectedImageUrl)} onOpenChange={(open) => (!open ? setSelectedImageUrl(null) : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("job.preview.title")}</DialogTitle>
          </DialogHeader>
          {selectedImageUrl ? (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-border bg-secondary">
                <img src={selectedImageUrl} alt={t("job.preview.alt")} className="w-full h-full object-contain" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="bg-transparent" asChild>
                  <a href={selectedImageUrl} download={`avatar-${jobId}.png`}>
                    {t("job.download")}
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
