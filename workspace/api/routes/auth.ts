/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from "express"
import bcrypt from "bcryptjs"
import { getDb } from "../context.js"
import { getAdminFromRequest, requireAdmin, signAdminToken } from "../auth.js"

const router = Router()

/**
 * User Login
 * POST /api/auth/login
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const accountRaw = String(req.body?.account ?? req.body?.email ?? "").trim()
  const account = accountRaw.toLowerCase()
  const password = String(req.body?.password || "")

  if (!accountRaw || !password) {
    res.status(400).json({ success: false, error: "Missing credentials" })
    return
  }

  const db = getDb()
  const row = db
    .prepare(
      "SELECT id, email, username, name, password_hash FROM admin_user WHERE lower(email) = ? OR lower(username) = ?",
    )
    .get(account, account) as any

  if (!row?.id) {
    res.status(401).json({ success: false, error: "Invalid credentials" })
    return
  }

  const ok = bcrypt.compareSync(password, row.password_hash)
  if (!ok) {
    res.status(401).json({ success: false, error: "Invalid credentials" })
    return
  }

  const token = signAdminToken({ sub: row.id, email: row.email, name: row.name })
  res.json({
    success: true,
    data: { token, user: { id: row.id, email: row.email, name: row.name } },
  })
})

router.get("/me", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    res.status(401).json({ success: false, error: "Unauthorized" })
    return
  }
  res.json({ success: true, data: { id: admin.sub, email: admin.email, name: admin.name } })
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true })
})

export default router
