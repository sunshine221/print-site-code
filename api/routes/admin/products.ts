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

router.get("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")

  const row = db
    .prepare(
      `SELECT id, title, summary, process, material, lead_time_days, price_hint, featured, published, tags_json, created_at, updated_at
       FROM product WHERE id = ?`,
    )
    .get(id) as any

  if (!row?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  const skus = db
    .prepare(
      `SELECT id, product_id, sku_code, attributes_json, price_min, price_max, currency, stock_qty, published, created_at, updated_at
       FROM product_sku WHERE product_id = ?
       ORDER BY created_at ASC`,
    )
    .all(id) as any[]

  res.json({
    success: true,
    data: {
      id: row.id,
      title: row.title,
      summary: row.summary,
      process: row.process,
      material: row.material,
      leadTimeDays: row.lead_time_days,
      priceHint: row.price_hint,
      featured: Boolean(row.featured),
      published: Boolean(row.published),
      tags: JSON.parse(row.tags_json || "[]"),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      skus: skus.map((s) => ({
        id: s.id,
        productId: s.product_id,
        skuCode: s.sku_code,
        attributes: JSON.parse(s.attributes_json || "{}"),
        priceMin: s.price_min,
        priceMax: s.price_max,
        currency: s.currency,
        stockQty: s.stock_qty,
        published: Boolean(s.published),
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })),
    },
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

router.post("/:id/skus", (req: Request, res: Response) => {
  const db = getDb()
  const productId = String(req.params.id || "")
  const existing = db.prepare("SELECT id FROM product WHERE id = ?").get(productId) as any
  if (!existing?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  const body = req.body || {}
  const skuCode = String(body.skuCode || "").trim()
  if (!skuCode) {
    res.status(400).json({ success: false, error: "Missing skuCode" })
    return
  }

  const id = nanoid()
  const ts = nowIso()
  db.prepare(
    `INSERT INTO product_sku (id, product_id, sku_code, attributes_json, price_min, price_max, currency, stock_qty, published, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    productId,
    skuCode,
    JSON.stringify(body.attributes || {}),
    body.priceMin != null ? Number(body.priceMin) : null,
    body.priceMax != null ? Number(body.priceMax) : null,
    body.currency ? String(body.currency) : "CNY",
    body.stockQty != null ? Number(body.stockQty) : null,
    body.published ? 1 : 0,
    ts,
    ts,
  )

  db.prepare("UPDATE product SET updated_at = ? WHERE id = ?").run(ts, productId)
  res.json({ success: true, data: { id } })
})

router.patch("/:id/skus/:skuId", (req: Request, res: Response) => {
  const db = getDb()
  const productId = String(req.params.id || "")
  const skuId = String(req.params.skuId || "")
  const existing = db
    .prepare("SELECT id FROM product_sku WHERE id = ? AND product_id = ?")
    .get(skuId, productId) as any
  if (!existing?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  const body = req.body || {}
  const updates: string[] = []
  const params: any[] = []

  if (body.skuCode !== undefined) {
    const skuCode = String(body.skuCode || "").trim()
    if (!skuCode) {
      res.status(400).json({ success: false, error: "Missing skuCode" })
      return
    }
    updates.push("sku_code = ?")
    params.push(skuCode)
  }
  if (body.attributes !== undefined) {
    updates.push("attributes_json = ?")
    params.push(JSON.stringify(body.attributes || {}))
  }
  if (body.priceMin !== undefined) {
    updates.push("price_min = ?")
    params.push(body.priceMin == null ? null : Number(body.priceMin))
  }
  if (body.priceMax !== undefined) {
    updates.push("price_max = ?")
    params.push(body.priceMax == null ? null : Number(body.priceMax))
  }
  if (body.currency !== undefined) {
    updates.push("currency = ?")
    params.push(body.currency ? String(body.currency) : "CNY")
  }
  if (body.stockQty !== undefined) {
    updates.push("stock_qty = ?")
    params.push(body.stockQty == null ? null : Number(body.stockQty))
  }
  if (body.published !== undefined) {
    updates.push("published = ?")
    params.push(body.published ? 1 : 0)
  }

  updates.push("updated_at = ?")
  const ts = nowIso()
  params.push(ts)
  params.push(skuId)
  params.push(productId)

  db.prepare(`UPDATE product_sku SET ${updates.join(", ")} WHERE id = ? AND product_id = ?`).run(...params)
  db.prepare("UPDATE product SET updated_at = ? WHERE id = ?").run(ts, productId)
  res.json({ success: true })
})

router.delete("/:id/skus/:skuId", (req: Request, res: Response) => {
  const db = getDb()
  const productId = String(req.params.id || "")
  const skuId = String(req.params.skuId || "")
  const ts = nowIso()
  db.prepare("DELETE FROM product_sku WHERE id = ? AND product_id = ?").run(skuId, productId)
  db.prepare("UPDATE product SET updated_at = ? WHERE id = ?").run(ts, productId)
  res.json({ success: true })
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
  db.transaction(() => {
    db.prepare("DELETE FROM product_sku WHERE product_id = ?").run(id)
    db.prepare("DELETE FROM product_media WHERE product_id = ?").run(id)
    db.prepare("DELETE FROM case_product WHERE product_id = ?").run(id)
    db.prepare("DELETE FROM product WHERE id = ?").run(id)
  })()
  res.json({ success: true })
})

export default router
