import "server-only"

export function trackEvent(event: string, data: Record<string, unknown> = {}) {
  if (process.env.TELEMETRY_DISABLED === "1") return

  const payload = {
    ts: new Date().toISOString(),
    event,
    ...data,
  }

  console.info(JSON.stringify(payload))
}

