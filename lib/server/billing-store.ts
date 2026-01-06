import "server-only"

import path from "node:path"
import { promises as fs } from "node:fs"
import { z } from "zod"
import { getDataDir } from "@/lib/server/data-dir"

const DATA_DIR = getDataDir()
const STORE_PATH = path.join(DATA_DIR, "billing.json")
const STORE_TMP_PATH = path.join(DATA_DIR, "billing.json.tmp")

const DEFAULT_MONTHLY_QUOTA = (() => {
  const parsed = Number.parseInt(process.env.DEFAULT_MONTHLY_QUOTA ?? "20", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 20
})()

function isProductionDeploy(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production"
  return process.env.NODE_ENV === "production"
}

export const SubscriptionStatusSchema = z.enum(["inactive", "active", "canceled", "past_due", "expired"])
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>

const SubscriptionProviderSchema = z.enum(["creem", "mock"])
export type SubscriptionProvider = z.infer<typeof SubscriptionProviderSchema>

const SubscriptionRecordSchema = z.object({
  userId: z.string(),
  provider: SubscriptionProviderSchema,
  status: SubscriptionStatusSchema,
  currentPeriodEnd: z.string().nullable(),
  planId: z.string().nullable(),
  creemCustomerId: z.string().nullable().optional(),
  creemSubscriptionId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type SubscriptionRecord = z.infer<typeof SubscriptionRecordSchema>

const UsageRecordSchema = z.object({
  userId: z.string(),
  month: z.string(),
  quotaTotal: z.number().int().nonnegative(),
  quotaUsed: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type UsageRecord = z.infer<typeof UsageRecordSchema>

const ChargeRecordSchema = z.object({
  jobId: z.string(),
  userId: z.string(),
  month: z.string(),
  chargedAt: z.string(),
})

type ChargeRecord = z.infer<typeof ChargeRecordSchema>

const StoreSchema = z.object({
  version: z.literal(1),
  subscriptions: z.record(SubscriptionRecordSchema),
  usages: z.record(UsageRecordSchema),
  charges: z.record(ChargeRecordSchema),
})

type Store = z.infer<typeof StoreSchema>

let storeCache: Store | null = null
let storeOp = Promise.resolve<void>(undefined)

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
      const backupPath = path.join(DATA_DIR, `billing.invalid.${Date.now()}.json`)
      await fs.writeFile(backupPath, raw, "utf8")
      storeCache = { version: 1, subscriptions: {}, usages: {}, charges: {} }
      await persistStore(storeCache)
      return storeCache
    }

    storeCache = parsed.data
    return storeCache
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      storeCache = { version: 1, subscriptions: {}, usages: {}, charges: {} }
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

function getCurrentMonth(date = new Date()): string {
  return date.toISOString().slice(0, 7)
}

function getUsageKey(userId: string, month: string): string {
  return `${userId}:${month}`
}

function computeQuotaTotal(planId?: string | null): number {
  const key = planId ? `PLAN_${planId.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_QUOTA` : null
  if (key) {
    const raw = process.env[key]
    if (raw) {
      const parsed = Number.parseInt(raw, 10)
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }
  }

  return DEFAULT_MONTHLY_QUOTA
}

function effectiveSubscriptionStatus(sub: SubscriptionRecord | null, now = new Date()): SubscriptionStatus {
  if (!sub) return "inactive"
  if (sub.status === "inactive" || sub.status === "past_due" || sub.status === "expired") return sub.status

  const status = sub.status
  if (!sub.currentPeriodEnd) return status

  const end = Date.parse(sub.currentPeriodEnd)
  if (!Number.isFinite(end)) return status
  return end > now.getTime() ? status : "expired"
}

export async function getSubscriptionForUser(userId: string): Promise<SubscriptionRecord | null> {
  return withStoreLock(async () => {
    const store = await loadStore()
    return store.subscriptions[userId] ?? null
  })
}

export async function upsertSubscriptionForUser(
  userId: string,
  patch: Omit<Partial<SubscriptionRecord>, "userId" | "createdAt" | "updatedAt"> & {
    provider: SubscriptionProvider
    status: SubscriptionStatus
  },
): Promise<SubscriptionRecord> {
  return withStoreLock(async () => {
    const store = await loadStore()
    const now = new Date().toISOString()
    const prev = store.subscriptions[userId]

    const next: SubscriptionRecord = {
      userId,
      provider: patch.provider,
      status: patch.status,
      currentPeriodEnd: patch.currentPeriodEnd ?? prev?.currentPeriodEnd ?? null,
      planId: patch.planId ?? prev?.planId ?? null,
      creemCustomerId: patch.creemCustomerId ?? prev?.creemCustomerId ?? null,
      creemSubscriptionId: patch.creemSubscriptionId ?? prev?.creemSubscriptionId ?? null,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    }

    store.subscriptions[userId] = next

    if (patch.status === "active") {
      const month = getCurrentMonth()
      const usageKey = getUsageKey(userId, month)
      const usage = store.usages[usageKey]
      const quotaTotal = computeQuotaTotal(next.planId)
      store.usages[usageKey] = usage
        ? { ...usage, quotaTotal: Math.max(usage.quotaTotal, quotaTotal), updatedAt: now }
        : {
            userId,
            month,
            quotaTotal,
            quotaUsed: 0,
            createdAt: now,
            updatedAt: now,
          }
    }

    await persistStore(store)
    return next
  })
}

export async function getUsageForUserMonth(userId: string, month: string): Promise<UsageRecord | null> {
  return withStoreLock(async () => {
    const store = await loadStore()
    return store.usages[getUsageKey(userId, month)] ?? null
  })
}

export async function getOrCreateUsageForCurrentMonth(userId: string): Promise<UsageRecord> {
  return withStoreLock(async () => {
    const store = await loadStore()
    const now = new Date().toISOString()
    const month = getCurrentMonth()
    const key = getUsageKey(userId, month)
    const existing = store.usages[key]
    if (existing) return existing

    const sub = store.subscriptions[userId]
    const quotaTotal = computeQuotaTotal(sub?.planId)
    const record: UsageRecord = {
      userId,
      month,
      quotaTotal,
      quotaUsed: 0,
      createdAt: now,
      updatedAt: now,
    }

    store.usages[key] = record
    await persistStore(store)
    return record
  })
}

export async function getEntitlementForUser(userId: string): Promise<{
  subscription: (Pick<SubscriptionRecord, "provider" | "planId" | "currentPeriodEnd"> & {
    status: SubscriptionStatus
  }) | null
  usage: Pick<UsageRecord, "month" | "quotaTotal" | "quotaUsed"> & { quotaRemaining: number }
}> {
  return withStoreLock(async () => {
    const store = await loadStore()
    const now = new Date()
    const allowMock = process.env.CREEM_MOCK === "1" || !isProductionDeploy()
    const subRaw = store.subscriptions[userId] ?? null
    const sub = !allowMock && subRaw?.provider === "mock" ? null : subRaw
    const status = effectiveSubscriptionStatus(sub, now)

    const month = getCurrentMonth(now)
    const usageKey = getUsageKey(userId, month)
    const usage = store.usages[usageKey] ?? null
    const quotaTotal = usage?.quotaTotal ?? computeQuotaTotal(sub?.planId)
    const quotaUsed = usage?.quotaUsed ?? 0
    const quotaRemaining = Math.max(0, quotaTotal - quotaUsed)

    return {
      subscription: sub
        ? {
            provider: sub.provider,
            planId: sub.planId,
            currentPeriodEnd: sub.currentPeriodEnd,
            status,
          }
        : null,
      usage: { month, quotaTotal, quotaUsed, quotaRemaining },
    }
  })
}

export async function recordSuccessfulJobCharge({
  userId,
  jobId,
  chargedAt,
}: {
  userId: string
  jobId: string
  chargedAt?: string
}): Promise<{ alreadyCharged: boolean; usage: UsageRecord }> {
  return withStoreLock(async () => {
    const store = await loadStore()
    const nowIso = chargedAt ?? new Date().toISOString()

    const existingCharge = store.charges[jobId]
    if (existingCharge) {
      const usage = store.usages[getUsageKey(userId, existingCharge.month)]
      if (!usage) {
        const fallbackUsage: UsageRecord = {
          userId,
          month: existingCharge.month,
          quotaTotal: computeQuotaTotal(store.subscriptions[userId]?.planId),
          quotaUsed: 0,
          createdAt: nowIso,
          updatedAt: nowIso,
        }
        store.usages[getUsageKey(userId, existingCharge.month)] = fallbackUsage
        await persistStore(store)
        return { alreadyCharged: true, usage: fallbackUsage }
      }
      return { alreadyCharged: true, usage }
    }

    const month = getCurrentMonth(new Date(nowIso))
    const usageKey = getUsageKey(userId, month)
    const current = store.usages[usageKey]
    const quotaTotal = current?.quotaTotal ?? computeQuotaTotal(store.subscriptions[userId]?.planId)
    const nextUsage: UsageRecord = current
      ? {
          ...current,
          quotaTotal: Math.max(current.quotaTotal, quotaTotal),
          quotaUsed: current.quotaUsed + 1,
          updatedAt: nowIso,
        }
      : {
          userId,
          month,
          quotaTotal,
          quotaUsed: 1,
          createdAt: nowIso,
          updatedAt: nowIso,
        }

    const charge: ChargeRecord = {
      jobId,
      userId,
      month,
      chargedAt: nowIso,
    }

    store.usages[usageKey] = nextUsage
    store.charges[jobId] = charge
    await persistStore(store)
    return { alreadyCharged: false, usage: nextUsage }
  })
}
