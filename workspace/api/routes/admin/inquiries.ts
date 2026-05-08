import { Router, type Request, type Response } from "express"
import { getDb } from "../../context.js"

const router = Router()

router.get("/", (req: Request, res: Response) => {
  const db = getDb()
  const status = req.query.status ? String(req.query.status) : ""
  const where: string[] = []
  const params: any[] = []
  if (status) {
    where.push("status = ?")
    params.push(status)
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""
  const rows = db
    .prepare(
      `SELECT id, status, inquiry_type, product_id, sku_id, request_json, estimate_json, pricing_rule_version, internal_note, created_at, updated_at
       FROM inquiry
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT 200`,
    )
    .all(...params) as any[]

  const data = rows.map((r) => ({
    id: r.id,
    status: r.status,
    inquiryType: r.inquiry_type,
    productId: r.product_id,
    skuId: r.sku_id,
    request: JSON.parse(r.request_json || "{}"),
    quoteEstimate: r.estimate_json ? JSON.parse(r.estimate_json) : null,
    pricingRuleVersion: r.pricing_rule_version,
    internalNote: r.internal_note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))

  res.json({ success: true, data })
})

router.get("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  const row = db
    .prepare(
      `SELECT id, status, inquiry_type, product_id, sku_id, request_json, estimate_json, pricing_rule_version, internal_note, created_at, updated_at
       FROM inquiry WHERE id = ?`,
    )
    .get(id) as any

  if (!row?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  const attachments = db
    .prepare(
      `SELECT m.id, m.url, m.name, m.size, m.mime_type
       FROM inquiry_attachment ia
       JOIN media m ON m.id = ia.media_id
       WHERE ia.inquiry_id = ?
       ORDER BY m.created_at ASC`,
    )
    .all(id) as any[]

  res.json({
    success: true,
    data: {
      id: row.id,
      status: row.status,
      inquiryType: row.inquiry_type,
      productId: row.product_id,
      skuId: row.sku_id,
      request: JSON.parse(row.request_json || "{}"),
      quoteEstimate: row.estimate_json ? JSON.parse(row.estimate_json) : null,
      pricingRuleVersion: row.pricing_rule_version,
      internalNote: row.internal_note,
      attachments: attachments.map((a) => ({
        id: a.id,
        url: a.url,
        name: a.name,
        size: a.size,
        mimeType: a.mime_type,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
  })
})

router.patch("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  const status = req.body?.status ? String(req.body.status) : undefined
  const internalNote = req.body?.internalNote != null ? String(req.body.internalNote) : undefined

  const existing = db.prepare("SELECT id FROM inquiry WHERE id = ?").get(id) as any
  if (!existing?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  const updates: string[] = []
  const params: any[] = []
  if (status) {
    updates.push("status = ?")
    params.push(status)
  }
  if (internalNote !== undefined) {
    updates.push("internal_note = ?")
    params.push(internalNote || null)
  }
  updates.push("updated_at = ?")
  params.push(new Date().toISOString())
  params.push(id)

  db.prepare(`UPDATE inquiry SET ${updates.join(", ")} WHERE id = ?`).run(...params)
  res.json({ success: true })
})

router.delete("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  db.transaction(() => {
    db.prepare("DELETE FROM inquiry_attachment WHERE inquiry_id = ?").run(id)
    db.prepare("DELETE FROM inquiry WHERE id = ?").run(id)
  })()
  res.json({ success: true })
})

export default router
