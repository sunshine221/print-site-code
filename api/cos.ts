import COS from "cos-nodejs-sdk-v5"
import { nanoid } from "nanoid"

export type PresignRequest = {
  fileName: string
  fileSize: number
  mimeType?: string
  scope?: "visitor" | "admin"
}

export type PresignResponse = {
  method: "PUT"
  url: string
  key: string
  bucket: string
  region: string
  headers: Record<string, string>
  expiresIn: number
}

const defaultMaxBytes = 200 * 1024 * 1024

export function getUploadMaxBytes() {
  const v = process.env.UPLOAD_MAX_BYTES?.trim()
  const n = v ? Number(v) : NaN
  if (Number.isFinite(n) && n > 0) return n
  return defaultMaxBytes
}

export function getAllowedExtensions() {
  const v = process.env.UPLOAD_ALLOWED_EXT?.trim()
  if (!v) {
    return ["stl", "step", "stp", "obj", "glb", "zip", "pdf", "png", "jpg", "jpeg"]
  }
  return v
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function sanitizeFileName(name: string) {
  const base = name.replace(/[/\\?%*:|"<>]/g, "_").trim()
  return base.length ? base : "file"
}

function getFileExt(fileName: string) {
  const idx = fileName.lastIndexOf(".")
  if (idx === -1) return ""
  return fileName.slice(idx + 1).toLowerCase()
}

export function getCosConfig() {
  const bucket = process.env.COS_BUCKET?.trim() || ""
  const region = process.env.COS_REGION?.trim() || ""
  const secretId = process.env.COS_SECRET_ID?.trim() || ""
  const secretKey = process.env.COS_SECRET_KEY?.trim() || ""
  return { bucket, region, secretId, secretKey }
}

export function createPresignedPutUrl(input: PresignRequest): PresignResponse {
  const { bucket, region, secretId, secretKey } = getCosConfig()
  if (!bucket || !region || !secretId || !secretKey) {
    throw new Error("COS is not configured")
  }

  const maxBytes = getUploadMaxBytes()
  if (!Number.isFinite(input.fileSize) || input.fileSize <= 0) {
    throw new Error("Invalid fileSize")
  }
  if (input.fileSize > maxBytes) {
    throw new Error(`File too large (max ${maxBytes} bytes)`)
  }

  const ext = getFileExt(input.fileName)
  const allowed = getAllowedExtensions()
  if (!ext || !allowed.includes(ext)) {
    throw new Error("File type not allowed")
  }

  const safeName = sanitizeFileName(input.fileName)
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const scopeDir = input.scope === "admin" ? "media" : "uploads"
  const key = `${scopeDir}/${day}/${nanoid()}_${safeName}`

  const cos = new COS({ SecretId: secretId, SecretKey: secretKey })
  const expiresIn = 15 * 60
  const mimeType = input.mimeType?.trim() || "application/octet-stream"

  const url = cos.getObjectUrl({
    Bucket: bucket,
    Region: region,
    Key: key,
    Method: "PUT",
    Sign: true,
    Expires: expiresIn,
  })

  return {
    method: "PUT",
    url,
    key,
    bucket,
    region,
    headers: { "Content-Type": mimeType },
    expiresIn,
  }
}
