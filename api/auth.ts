import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"

export type JwtAdminPayload = {
  sub: string
  email: string
  name: string
}

export function getJwtSecret() {
  const v = process.env.JWT_SECRET?.trim()
  if (v) return v
  return process.env.NODE_ENV === "production" ? "" : "dev-secret"
}

export function signAdminToken(payload: JwtAdminPayload) {
  const secret = getJwtSecret()
  if (!secret) {
    throw new Error("JWT_SECRET is required in production")
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : ""
  if (!token) {
    res.status(401).json({ success: false, error: "Unauthorized" })
    return
  }

  const secret = getJwtSecret()
  if (!secret) {
    res.status(500).json({ success: false, error: "Server misconfigured" })
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtAdminPayload
    ;(req as any).admin = decoded
    next()
  } catch {
    res.status(401).json({ success: false, error: "Unauthorized" })
  }
}

export function getAdminFromRequest(req: Request): JwtAdminPayload | null {
  return ((req as any).admin as JwtAdminPayload) ?? null
}

