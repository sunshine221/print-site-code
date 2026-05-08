import { Router, type Request, type Response } from "express"
import { getDb } from "../context.js"

const router = Router()

router.get("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  const row = db
    .prepare("SELECT id, type, url, name, size, mime_type, created_at FROM media WHERE id = ?")
    .get(id) as any

  if (!row?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  res.json({
    success: true,
    data: {
      id: row.id,
      type: row.type,
      url: row.url,
      name: row.name,
      size: row.size,
      mimeType: row.mime_type,
      createdAt: row.created_at,
    },
  })
})

export default router

