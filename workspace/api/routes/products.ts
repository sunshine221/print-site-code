import { Router, type Request, type Response } from "express"
import { getDb } from "../context.js"

const router = Router()

function parseBool(v: string | undefined) {
  if (!v) return null
  if (v === "1" || v.toLowerCase() === "true") return true
  if (v === "0" || v.toLowerCase() === "false") return false
  return null
}

router.get("/", (req: Request, res: Response) => {
  const db = getDb()
  const search = String(req.query.search || "").trim()
  const featured = parseBool(req.query.featured as string | undefined)
  const published = parseBool(req.query.published as string | undefined) ?? true

  const where: string[] = []
  const params: any[] = []

  if (published !== null) {
    where.push("published = ?")
    params.push(published ? 1 : 0)
  }

  if (featured !== null) {
    where.push("featured = ?")
    params.push(featured ? 1 : 0)
  }

  if (search) {
    where.push("(title LIKE ? OR summary LIKE ? OR id LIKE ?)")
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""
  const rows = db
    .prepare(
      `SELECT id, title, summary, process, material, lead_time_days, price_hint, featured, published, tags_json, created_at, updated_at
       FROM product
       ${whereSql}
       ORDER BY featured DESC, updated_at DESC`,
    )
    .all(...params) as any[]

  const coverByProduct = new Map<string, any>()
  const coverRows = db
    .prepare(
      `SELECT pm.product_id as productId, m.id as mediaId, m.type, m.url, m.name
       FROM product_media pm
       JOIN media m ON m.id = pm.media_id
       WHERE pm.sort_order = 0`,
    )
    .all() as any[]
  for (const r of coverRows) {
    coverByProduct.set(r.productId, { id: r.mediaId, type: r.type, url: r.url, name: r.name })
  }

  const data = rows.map((r) => ({
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
    cover: coverByProduct.get(r.id) ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))

  res.json({ success: true, data })
})

router.get("/:id", (req: Request, res: Response) => {
  const db = getDb()
  const id = String(req.params.id || "")
  const product = db
    .prepare(
      `SELECT id, title, summary, process, material, lead_time_days, price_hint, featured, published, tags_json, created_at, updated_at
       FROM product WHERE id = ?`,
    )
    .get(id) as any

  if (!product?.id) {
    res.status(404).json({ success: false, error: "Not found" })
    return
  }

  const skus = db
    .prepare(
      `SELECT id, sku_code, attributes_json, price_min, price_max, currency, stock_qty, published, created_at, updated_at
       FROM product_sku
       WHERE product_id = ?
       ORDER BY published DESC, sku_code ASC`,
    )
    .all(id) as any[]

  const media = db
    .prepare(
      `SELECT m.id, m.type, m.url, m.name, pm.sort_order as sortOrder
       FROM product_media pm
       JOIN media m ON m.id = pm.media_id
       WHERE pm.product_id = ?
       ORDER BY pm.sort_order ASC`,
    )
    .all(id) as any[]

  res.json({
    success: true,
    data: {
      id: product.id,
      title: product.title,
      summary: product.summary,
      process: product.process,
      material: product.material,
      leadTimeDays: product.lead_time_days,
      priceHint: product.price_hint,
      featured: Boolean(product.featured),
      published: Boolean(product.published),
      tags: JSON.parse(product.tags_json || "[]"),
      skus: skus.map((s) => ({
        id: s.id,
        skuCode: s.sku_code,
        attributes: JSON.parse(s.attributes_json || "{}"),
        priceMin: s.price_min,
        priceMax: s.price_max,
        currency: s.currency,
        stockQty: s.stock_qty,
        published: Boolean(s.published),
      })),
      media: media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        name: m.name,
        sortOrder: m.sortOrder,
      })),
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    },
  })
})

export default router

