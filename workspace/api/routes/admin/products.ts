import { Router, type Request, type Response } from "express"
import { nanoid } from "nanoid"
import { getDb } from "../../context.js"

const router = Router()

function nowIso() {
  return new Date().toISOString()
}

router.get("/", (req: Request, res: Response) => {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT id, title, summary, process, material, lead_time_days, price_hint, featured, published, tags_json, created_at, updated_at
       FROM product
       ORDER BY updated_at DESC
       LIMIT 500`,
    )
    .all() as any[]

  res.json({
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      process: r.process,
      material: r.material,
      leadTimeDays: r.lead_time_days,
      priceHint: r.price_hint,
      featured: Boolean(r.featured),
      published: Boolean(r.published),
      tags: JSON.parse(r.tags_json || "[]"),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  })
})

router.post("/", (req: Request, res: Response) => {
  const db = getDb()
  const body = req.body || {}
  const title = String(body.title || "").trim()
  const summary = String(body.summary || "").trim()
  if (!title || !summary) {
    res.status(400).json({ success: false, error: "Missing title/summary" })
    return
  }

  const id = nanoid()
  const ts = nowIso()
  db.prepare(
    `INSERT INTO product (id, title, summary, process, material, lead_time_days, price_hint, featured, published, tags_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    title,
    summary,
    body.process ? String(body.process) : null,
    body.material ? String(body.material) : null,
    body.leadTimeDays != null ? Number(body.leadTimeDays) : null,
    body.priceHint ? String(body.priceHint) : null,
    body.featured ? 1 : 0,
    body.published ? 1 : 0,
    JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
    ts,
    ts,
  )
  res.json({ success: true, data: { id } })
})

router.patch("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  const existing = db.prepare("SELECT id FROM product WHERE id = ?").get(id) as any
  if (!existing?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  const body = req.body || {}
  const updates: string[] = []
  const params: any[] = []

  const fields: Array<[string, string]> = [
    ["title", "title"],
    ["summary", "summary"],
    ["process", "process"],
    ["material", "material"],
    ["price_hint", "priceHint"],
  ]
  for (const [col, key] of fields) {
    if (body[key] === undefined) continue
    updates.push(`${col} = ?`)
    params.push(body[key] === null ? null : String(body[key]))
  }

  if (body.leadTimeDays !== undefined) {
    updates.push("lead_time_days = ?")
    const n = body.leadTimeDays === null ? null : Number(body.leadTimeDays)
    params.push(Number.isFinite(n as any) ? n : null)
  }

  if (body.featured !== undefined) {
    updates.push("featured = ?")
    params.push(body.featured ? 1 : 0)
  }
  if (body.published !== undefined) {
    updates.push("published = ?")
    params.push(body.published ? 1 : 0)
  }
  if (body.tags !== undefined) {
    updates.push("tags_json = ?")
    params.push(JSON.stringify(Array.isArray(body.tags) ? body.tags : []))
  }

  updates.push("updated_at = ?")
  params.push(nowIso())
  params.push(id)

  db.prepare(`UPDATE product SET ${updates.join(", ")} WHERE id = ?`).run(...params)
  res.json({ success: true })
})

router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  db.prepare("DELETE FROM product WHERE id = ?").run(id)
  res.json({ success: true })
})

export default router
