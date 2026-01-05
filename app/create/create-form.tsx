"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { ImageIcon, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { getActiveStylePacks, getStylePackById, type StylePackId } from "@/lib/style-packs"
import { CreateJobResponseSchema } from "@/lib/jobs"
import { BillingStatusResponseSchema, type BillingStatusResponse } from "@/lib/billing"
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  allowedUploadTypeLabel,
  isAllowedUploadMimeType,
} from "@/lib/images"

async function fetchBillingStatus(): Promise<BillingStatusResponse> {
  const res = await fetch("/api/billing/status", { cache: "no-store" })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "获取订阅状态失败"
    throw new Error(message)
  }
  return BillingStatusResponseSchema.parse(json)
}

export function CreateForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const packs = useMemo(() => getActiveStylePacks(), [])

  const [selectedStyleId, setSelectedStyleId] = useState<StylePackId | null>(null)
  const [identityStrength, setIdentityStrength] = useState(30)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [sourceJobId, setSourceJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [billingStatus, setBillingStatus] = useState<BillingStatusResponse | null>(null)
  const [billingLoading, setBillingLoading] = useState(true)
  const [billingError, setBillingError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const next = await fetchBillingStatus()
        if (cancelled) return
        setBillingStatus(next)
        setBillingError(null)
      } catch (err) {
        if (cancelled) return
        setBillingError(err instanceof Error ? err.message : "获取订阅状态失败")
      } finally {
        if (!cancelled) setBillingLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const styleFromQuery = searchParams.get("style")
    if (!styleFromQuery) return
    const pack = getStylePackById(styleFromQuery)
    if (!pack?.isActive) return
    setSelectedStyleId(pack.id)
  }, [searchParams])

  useEffect(() => {
    const fromJob = searchParams.get("fromJob")
    if (!fromJob) return
    setSourceJobId(fromJob)
  }, [searchParams])

  useEffect(() => {
    const raw = searchParams.get("identityStrength")
    if (!raw) return
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed)) return
    const clamped = Math.max(0, Math.min(100, parsed))
    setIdentityStrength(clamped)
  }, [searchParams])

  const selectedPack = useMemo(
    () => (selectedStyleId ? getStylePackById(selectedStyleId) : undefined),
    [selectedStyleId],
  )

  const handleImageUpload = (file: File) => {
    if (!isAllowedUploadMimeType(file.type)) {
      setError(`请上传 ${allowedUploadTypeLabel()} 图片`)
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("图片过大，请上传不超过 10MB 的图片")
      return
    }

    setError(null)
    setUploadedFile(file)
    setSourceJobId(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleImageUpload(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    handleImageUpload(file)
  }

  const clearImage = () => {
    setUploadedFile(null)
    setUploadedImage(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const canCreateJob = billingStatus?.canCreateJob ?? false
  const canGenerate = Boolean((uploadedFile || sourceJobId) && selectedStyleId && !submitting && canCreateJob)

  const onGenerate = async () => {
    if (!selectedStyleId) return
    if (!uploadedFile && !sourceJobId) {
      setError("请上传图片或从历史任务复用照片")
      return
    }

    if (billingLoading) {
      setError("正在检查订阅状态，请稍后重试")
      return
    }
    if (!canCreateJob) {
      setError(billingStatus?.createBlockedReason ?? "当前状态不可创建任务")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("stylePackId", selectedStyleId)
      formData.append("identityStrength", String(identityStrength))
      if (uploadedFile) formData.append("image", uploadedFile)
      if (!uploadedFile && sourceJobId) formData.append("sourceJobId", sourceJobId)

      const res = await fetch("/api/jobs", { method: "POST", body: formData })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const message = typeof json?.error === "string" ? json.error : "创建任务失败，请稍后重试"
        throw new Error(message)
      }

      const data = CreateJobResponseSchema.parse(json)
      router.push(`/jobs/${data.jobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建任务失败，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <Alert>
        <ImageIcon className="h-4 w-4" />
        <AlertTitle>上传建议</AlertTitle>
        <AlertDescription>
          <p>正脸、无遮挡、光线充足；面部占画面比例适中。</p>
        </AlertDescription>
      </Alert>

      <section className="bg-card border border-border rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">1) 上传自拍</h2>

        {sourceJobId && !uploadedFile ? (
          <Alert className="mb-4">
            <AlertTitle>复用照片</AlertTitle>
            <AlertDescription>将复用任务 {sourceJobId} 的上传照片；如需更换请重新上传。</AlertDescription>
          </Alert>
        ) : null}

        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 transition-colors",
            uploadedImage ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          )}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {uploadedImage ? (
            <div className="relative">
              <img
                src={uploadedImage}
                alt="已上传预览"
                className="max-h-80 mx-auto rounded-xl object-contain"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-2">拖拽图片到这里</p>
              <p className="text-sm text-muted-foreground mb-4">或点击选择文件（≤ 10MB · {allowedUploadTypeLabel()}）</p>

              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_UPLOAD_MIME_TYPES.join(",")}
                onChange={onFileChange}
                className="hidden"
                id="avatar-image-upload"
              />
              <label htmlFor="avatar-image-upload">
                <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                  <span>选择图片</span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </section>

      <section className="bg-card border border-border rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">2) 选择风格包</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => {
            const selected = pack.id === selectedStyleId
            return (
              <button
                type="button"
                key={pack.id}
                onClick={() => setSelectedStyleId(pack.id)}
                className={cn(
                  "text-left rounded-2xl border overflow-hidden transition-colors bg-background",
                  selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50",
                )}
              >
                <div className="aspect-square bg-secondary">
                  <img src={pack.sampleImage} alt={`${pack.name} 示例图`} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="font-semibold text-foreground">{pack.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{pack.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="bg-card border border-border rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">3) 微调参数</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">更像画风 / 更像本人</div>
            <div className="text-sm text-muted-foreground">
              画风 {100 - identityStrength}% · 本人 {identityStrength}%
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>更像画风</span>
            <span>更像本人</span>
          </div>
          <Slider value={[identityStrength]} onValueChange={([v]) => setIdentityStrength(v)} />

          <p className="text-sm text-muted-foreground">
            当前选择：{selectedPack?.name ?? "未选择"}；本次生成成功后将扣减 1 次（默认产出 4 张）。
            {billingStatus ? ` 本月剩余 ${billingStatus.usage.quotaRemaining} 次。` : null}
          </p>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {billingLoading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              <span>正在检查订阅状态…</span>
            </span>
          ) : billingError ? (
            <span className="text-destructive">{billingError}</span>
          ) : billingStatus?.canCreateJob ? (
            <span>订阅有效，本月剩余 {billingStatus.usage.quotaRemaining} 次</span>
          ) : (
            <span>
              {billingStatus?.createBlockedReason ?? "订阅有效且额度充足时可创建生成任务"}{" "}
              <Link href="/pricing" className="underline">
                去订阅
              </Link>
            </span>
          )}
        </div>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          disabled={!canGenerate}
          onClick={onGenerate}
        >
          {submitting ? "创建任务中…" : "开始生成"}
        </Button>
      </div>
    </div>
  )
}
