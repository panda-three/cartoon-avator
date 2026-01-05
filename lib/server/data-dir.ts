import "server-only"

import path from "node:path"

function resolveDir(value: string): string {
  if (path.isAbsolute(value)) return value
  return path.join(process.cwd(), value)
}

export function getDataDir(): string {
  const override = process.env.DATA_DIR?.trim()
  if (override) return resolveDir(override)

  if (process.env.VERCEL === "1") {
    return path.join("/tmp", "zl-data")
  }

  return path.join(process.cwd(), ".data")
}

