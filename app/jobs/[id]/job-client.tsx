"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Clock, RefreshCcw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { GetJobResponseSchema, type JobPublic, type JobStatus } from "@/lib/jobs"
import { getStylePackById } from "@/lib/style-packs"

type Props = {
  jobId: string
}

function statusMeta(status: JobStatus) {
  switch (status) {
    case "queued":
      return { label: "排队中", icon: Clock }
    case "running":
      return { label: "生成中", icon: Spinner }
    case "succeeded":
      return { label: "已完成", icon: CheckCircle2 }
    case "failed":
      return { label: "失败", icon: AlertCircle }
    case "canceled":
      return { label: "已取消", icon: XCircle }
  }
}

async function fetchJob(jobId: string): Promise<JobPublic> {
  const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "获取任务失败"
    throw new Error(message)
  }
  return GetJobResponseSchema.parse(json).job
}

export function JobClient({ jobId }: Props) {
  const router = useRouter()

  const [job, setJob] = useState<JobPublic | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<"retry" | "cancel" | "clone" | null>(null)

  const pack = useMemo(() => (job ? getStylePackById(job.stylePackId) : undefined), [job])

  const refresh = useCallback(async () => {
    const data = await fetchJob(jobId)
    setJob(data)
    setError(null)
  }, [jobId])

  useEffect(() => {
    let cancelled = false
    let timer: number | null = null

    const tick = async () => {
      try {
        const data = await fetchJob(jobId)
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
        setError(err instanceof Error ? err.message : "获取任务失败")
        timer = window.setTimeout(tick, 3000)
      }
    }

    void tick()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [jobId])

  const onRetry = async () => {
    setActionLoading("retry")
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const message = typeof json?.error === "string" ? json.error : "重试失败"
        throw new Error(message)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "重试失败")
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
        const message = typeof json?.error === "string" ? json.error : "取消失败"
        throw new Error(message)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "取消失败")
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
        const message = typeof json?.error === "string" ? json.error : "创建新任务失败"
        throw new Error(message)
      }
      const nextJobId = typeof json?.jobId === "string" ? json.jobId : null
      if (!nextJobId) throw new Error("创建新任务失败")
      router.push(`/jobs/${nextJobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建新任务失败")
    } finally {
      setActionLoading(null)
    }
  }

  const status = job?.status ?? "queued"
  const meta = statusMeta(status)
  const StatusIcon = meta.icon

  const adjustHref =
    job && pack
      ? `/create?fromJob=${encodeURIComponent(job.id)}&style=${encodeURIComponent(pack.id)}&identityStrength=${job.params.identityStrength}`
      : `/create?fromJob=${encodeURIComponent(jobId)}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>任务状态</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div className="flex items-center gap-2">
            {StatusIcon === Spinner ? <Spinner className="size-4" /> : <StatusIcon className="size-4" />}
            <span className="text-foreground font-medium">{meta.label}</span>
            {job ? <span className="text-xs text-muted-foreground">第 {job.attempt} 次</span> : null}
            {job?.provider === "mock" ? <span className="text-xs text-muted-foreground">mock</span> : null}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>风格包：{pack?.name ?? job?.stylePackId ?? "-"}</div>
            <div>本人 {job ? `${job.params.identityStrength}%` : "-"}</div>
          </div>

          {job?.status === "failed" ? (
            <div className="text-destructive">{job.error?.message ?? "生成失败，请稍后重试"}</div>
          ) : null}
          {job?.status === "canceled" ? <div>任务已取消</div> : null}
          {loading ? <div>加载中…</div> : null}
          {error ? <div className="text-destructive">{error}</div> : null}
        </CardContent>
      </Card>

      {job?.status === "succeeded" ? (
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
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
                    alt={`结果 ${idx + 1}`}
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
                再生成一组（同参数）
              </Button>
              <Button variant="outline" className="bg-transparent" asChild>
                <Link href={adjustHref}>调整参数后再生成</Link>
              </Button>
              <Button variant="outline" className="bg-transparent" asChild>
                <Link href="/">返回首页</Link>
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
            重试
          </Button>
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href={adjustHref}>调整参数后再生成</Link>
          </Button>
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      ) : null}

      {job?.status === "queued" || job?.status === "running" ? (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button variant="outline" className="bg-transparent" onClick={onCancel} disabled={actionLoading === "cancel"}>
            {actionLoading === "cancel" ? <Spinner className="mr-2" /> : null}
            取消任务
          </Button>
          <Button variant="outline" className="bg-transparent" asChild>
            <Link href="/create">返回创建页</Link>
          </Button>
        </div>
      ) : null}

      <Dialog open={Boolean(selectedImageUrl)} onOpenChange={(open) => (!open ? setSelectedImageUrl(null) : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>预览</DialogTitle>
          </DialogHeader>
          {selectedImageUrl ? (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-border bg-secondary">
                <img src={selectedImageUrl} alt="预览" className="w-full h-full object-contain" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="bg-transparent" asChild>
                  <a href={selectedImageUrl} download={`avatar-${jobId}.png`}>
                    下载
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

