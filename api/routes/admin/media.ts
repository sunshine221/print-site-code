import { Router, type Request, type Response } from "express"
import { nanoid } from "nanoid"
import { getDb } from "../../context.js"

const router = Router()

function nowIso() {
  return new Date().toISOString()
}

router.post("/", (req: Request, res: Response) => {
  const db = getDb()
  const body = req.body || {}
  const type = String(body.type || "file")
  const url = String(body.url || "").trim()
  const name = String(body.name || "").trim() || "asset"
  const size = body.size != null ? Number(body.size) : null
  const mimeType = body.mimeType ? String(body.mimeType) : null

  if (!url) {
    res.status(400).json({ success: false, error: "Missing url" })
    return
  }

  const id = nanoid()
  db.prepare(
    "INSERT INTO media (id, type, url, name, size, mime_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(id, type, url, name, Number.isFinite(size as any) ? size : null, mimeType, nowIso())

  res.json({ success: true, data: { id } })
})

router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  db.prepare("DELETE FROM media WHERE id = ?").run(id)
  res.json({ success: true })
})

export default router

