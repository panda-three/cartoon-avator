export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export const ALLOWED_UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number]

export function isAllowedUploadMimeType(mime: string): mime is AllowedUploadMimeType {
  return (ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(mime)
}

export function allowedUploadTypeLabel(): string {
  return "JPG/PNG/WEBP"
}

