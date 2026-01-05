import { NextResponse } from "next/server"
import { getJobRecord, updateJobRecord } from "@/lib/server/job-store"
import { getUserId } from "@/lib/server/auth"

export const runtime = "nodejs"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "缺少用户身份，请刷新页面后重试" }, { status: 401 })
  }

  const job = await getJobRecord(id)
  if (!job) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }
  if (job.userId !== userId) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }

  if (job.status === "succeeded" || job.status === "failed" || job.status === "canceled") {
    return NextResponse.json({ error: "当前状态不可取消" }, { status: 400 })
  }

  const now = new Date().toISOString()
  await updateJobRecord(id, (prev) => ({
    ...prev,
    status: "canceled",
    updatedAt: now,
  }))

  return NextResponse.json({ jobId: id })
}
