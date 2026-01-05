import "server-only"

import crypto from "node:crypto"
import path from "node:path"
import { promises as fs } from "node:fs"
import { z } from "zod"
import { JobPublicSchema, type JobParams, type JobPublic, type JobProvider } from "@/lib/jobs"
import { getDataDir } from "@/lib/server/data-dir"

const DATA_DIR = getDataDir()
const STORE_PATH = path.join(DATA_DIR, "jobs.json")
const STORE_TMP_PATH = path.join(DATA_DIR, "jobs.json.tmp")

const RETENTION_DAYS = (() => {
  const parsed = Number.parseInt(process.env.IMAGE_RETENTION_DAYS ?? "7", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7
})()

const JobRecordSchema = JobPublicSchema.extend({
  inputImageUrl: z.string(),
  userId: z.string().optional(),
  chargedAt: z.string().nullable().optional(),
})
export type JobRecord = z.infer<typeof JobRecordSchema>

const StoreSchema = z.object({
  version: z.literal(1),
  jobs: z.record(JobRecordSchema),
})

type Store = z.infer<typeof StoreSchema>

let storeCache: Store | null = null
let storeOp = Promise.resolve<void>(undefined)

function jobCreatedAtMs(job: JobRecord): number | null {
  const ms = Date.parse(job.createdAt)
  return Number.isFinite(ms) ? ms : null
}

function isJobExpired(job: JobRecord, nowMs = Date.now()): boolean {
  const createdAtMs = jobCreatedAtMs(job)
  if (createdAtMs === null) return false
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000
  return createdAtMs + retentionMs <= nowMs
}

function sortByNewestFirst(a: JobRecord, b: JobRecord): number {
  const aMs = jobCreatedAtMs(a) ?? 0
  const bMs = jobCreatedAtMs(b) ?? 0
  if (aMs !== bMs) return bMs - aMs
  const aUpdated = Date.parse(a.updatedAt)
  const bUpdated = Date.parse(b.updatedAt)
  return (Number.isFinite(bUpdated) ? bUpdated : 0) - (Number.isFinite(aUpdated) ? aUpdated : 0)
}

function withStoreLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = storeOp.then(fn, fn)
  storeOp = next.then(
    () => undefined,
    () => undefined,
  )
  return next
}

async function loadStore(): Promise<Store> {
  if (storeCache) return storeCache

  await fs.mkdir(DATA_DIR, { recursive: true })

  try {
    const raw = await fs.readFile(STORE_PATH, "utf8")
    const parsed = StoreSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      const backupPath = path.join(DATA_DIR, `jobs.invalid.${Date.now()}.json`)
      await fs.writeFile(backupPath, raw, "utf8")
      storeCache = { version: 1, jobs: {} }
      await persistStore(storeCache)
      return storeCache
    }
    storeCache = parsed.data
    return storeCache
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      storeCache = { version: 1, jobs: {} }
      await persistStore(storeCache)
      return storeCache
    }
    throw err
  }
}

async function persistStore(store: Store) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const payload = JSON.stringify(store, null, 2)
  await fs.writeFile(STORE_TMP_PATH, payload, "utf8")
  await fs.rename(STORE_TMP_PATH, STORE_PATH)
}

async function pruneExpiredJobs(store: Store) {
  const nowMs = Date.now()
  let changed = false

  for (const [jobId, job] of Object.entries(store.jobs)) {
    if (!isJobExpired(job, nowMs)) continue
    delete store.jobs[jobId]
    changed = true
  }

  if (changed) {
    await persistStore(store)
  }
}

async function loadStoreWithPrune(): Promise<Store> {
  const store = await loadStore()
  await pruneExpiredJobs(store)
  return store
}

export function getJobRetentionDays(): number {
  return RETENTION_DAYS
}

export async function createJob({
  stylePackId,
  params,
  inputImageUrl,
  provider,
  userId,
}: {
  stylePackId: string
  params: JobParams
  inputImageUrl: string
  provider: JobProvider
  userId: string
}): Promise<JobRecord> {
  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    const id = `job_${crypto.randomUUID()}`
    const now = new Date().toISOString()
    const job: JobRecord = {
      id,
      userId,
      status: "queued",
      stylePackId,
      params,
      inputImageUrl,
      outputImageUrls: [],
      error: null,
      attempt: 1,
      provider,
      chargedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    store.jobs[id] = job
    await persistStore(store)
    return job
  })
}

export async function getJobRecord(jobId: string): Promise<JobRecord | null> {
  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    return store.jobs[jobId] ?? null
  })
}

export async function getJobPublic(jobId: string): Promise<JobPublic | null> {
  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    const record = store.jobs[jobId]
    if (!record) return null

    const { inputImageUrl: _inputImageUrl, userId: _userId, chargedAt: _chargedAt, ...rest } = record
    return rest
  })
}

export async function updateJobRecord(
  jobId: string,
  update: (job: JobRecord) => JobRecord,
): Promise<JobRecord | null> {
  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    const job = store.jobs[jobId]
    if (!job) return null

    const next = update(job)
    store.jobs[jobId] = next
    await persistStore(store)
    return next
  })
}

export async function cloneJobFromSource({
  sourceJobId,
  stylePackId,
  params,
  provider,
  userId,
}: {
  sourceJobId: string
  stylePackId: string
  params: JobParams
  provider: JobProvider
  userId: string
}): Promise<JobRecord | null> {
  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    const source = store.jobs[sourceJobId]
    if (!source) return null
    if (source.userId !== userId) return null

    const id = `job_${crypto.randomUUID()}`
    const now = new Date().toISOString()

    const job: JobRecord = {
      id,
      userId,
      status: "queued",
      stylePackId,
      params,
      inputImageUrl: source.inputImageUrl,
      outputImageUrls: [],
      error: null,
      attempt: 1,
      provider,
      chargedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    store.jobs[id] = job
    await persistStore(store)
    return job
  })
}

export async function getActiveJobIdForUser(userId: string): Promise<string | null> {
  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    for (const job of Object.values(store.jobs)) {
      if (job.userId !== userId) continue
      if (job.status === "queued" || job.status === "running") return job.id
    }
    return null
  })
}

export async function listJobsPublicForUser({
  userId,
  limit,
}: {
  userId: string
  limit?: number
}): Promise<JobPublic[]> {
  const resolvedLimit = typeof limit === "number" && Number.isFinite(limit) ? Math.max(1, Math.min(30, limit)) : 30

  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    return Object.values(store.jobs)
      .filter((job) => job.userId === userId)
      .sort(sortByNewestFirst)
      .slice(0, resolvedLimit)
      .map(({ inputImageUrl: _inputImageUrl, userId: _userId, chargedAt: _chargedAt, ...rest }) => rest)
  })
}

export async function deleteJobForUser({ jobId, userId }: { jobId: string; userId: string }): Promise<boolean> {
  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    const existing = store.jobs[jobId]
    if (!existing) return false
    if (existing.userId !== userId) return false

    delete store.jobs[jobId]
    await persistStore(store)
    return true
  })
}

export async function deleteJobsForUser(userId: string): Promise<number> {
  return withStoreLock(async () => {
    const store = await loadStoreWithPrune()
    const ids = Object.entries(store.jobs)
      .filter(([, job]) => job.userId === userId)
      .map(([id]) => id)

    for (const id of ids) {
      delete store.jobs[id]
    }

    if (ids.length) {
      await persistStore(store)
    }

    return ids.length
  })
}
