import { NextResponse } from "next/server"
import { deleteJobForUser, getJobRecord } from "@/lib/server/job-store"
import { getUserId } from "@/lib/server/auth"

export const runtime = "nodejs"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "缺少用户身份，请刷新页面后重试" }, { status: 401 })
  }

  const record = await getJobRecord(id)
  if (!record || record.userId !== userId) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }

  const { inputImageUrl: _inputImageUrl, userId: _userId, chargedAt: _chargedAt, ...job } = record
  return NextResponse.json({ job })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "缺少用户身份，请刷新页面后重试" }, { status: 401 })
  }

  const record = await getJobRecord(id)
  if (!record || record.userId !== userId) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }

  const ok = await deleteJobForUser({ jobId: id, userId })
  if (!ok) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 })
  }

  return NextResponse.json({ jobId: id })
}
