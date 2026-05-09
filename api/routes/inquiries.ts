import { Router, type Request, type Response } from "express"
import { nanoid } from "nanoid"
import { getDb } from "../context.js"

const router = Router()

function nowIso() {
  return new Date().toISOString()
}

router.post("/", (req: Request, res: Response) => {
  const body = req.body || {}
  const inquiryType = String(body.inquiryType || "")

  const name = String(body.name || "").trim()
  const phone = String(body.phone || "").trim()
  const quantity = body.quantity != null ? Number(body.quantity) : undefined
  const notes = String(body.notes || "").trim()
  const skuId = body.skuId ? String(body.skuId) : undefined
  const productId = body.productId ? String(body.productId) : undefined

  if (!name || !phone) {
    res.status(400).json({ success: false, error: "Missing required fields" })
    return
  }

  if (quantity == null || !Number.isFinite(quantity) || quantity < 1) {
    res.status(400).json({ success: false, error: "Invalid quantity" })
    return
  }

  if (inquiryType !== "service_print" && inquiryType !== "platform_product") {
    res.status(400).json({ success: false, error: "Invalid inquiryType" })
    return
  }

  if (inquiryType === "platform_product" && !skuId) {
    res.status(400).json({ success: false, error: "Missing skuId" })
    return
  }

  const attachments = Array.isArray(body.attachments) ? body.attachments : []
  if (inquiryType === "platform_product" && attachments.length > 0) {
    res.status(400).json({ success: false, error: "Attachments not allowed for platform_product" })
    return
  }

  const db = getDb()

  let resolvedProductId = productId
  if (!resolvedProductId && skuId) {
    const sku = db
      .prepare("SELECT product_id as productId FROM product_sku WHERE id = ?")
      .get(skuId) as { productId?: string } | undefined
    if (sku?.productId) resolvedProductId = sku.productId
  }

  if (inquiryType === "platform_product") {
    const sku = db
      .prepare("SELECT id, product_id as productId FROM product_sku WHERE id = ?")
      .get(skuId) as { id?: string; productId?: string } | undefined
    if (!sku?.id) {
      res.status(400).json({ success: false, error: "Invalid skuId" })
      return
    }
    if (productId && sku.productId !== productId) {
      res.status(400).json({ success: false, error: "skuId not belong to productId" })
      return
    }
    resolvedProductId = sku.productId
  }

  const createdAt = nowIso()
  const inquiryId = nanoid()

  const mediaRows: { id: string; name: string; url: string; mimeType?: string; size?: number }[] =
    []
  if (inquiryType === "service_print") {
    for (const a of attachments) {
      const url = String(a.url || "").trim()
      const name = String(a.name || "").trim() || "attachment"
      if (!url) continue
      mediaRows.push({
        id: nanoid(),
        name,
        url,
        mimeType: a.mimeType ? String(a.mimeType) : undefined,
        size: a.size != null ? Number(a.size) : undefined,
      })
    }
  }

  db.transaction(() => {
    db.prepare(
      `INSERT INTO inquiry
        (id, status, inquiry_type, product_id, sku_id, request_json, estimate_json, pricing_rule_version, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      inquiryId,
      "new",
      inquiryType,
      resolvedProductId ?? null,
      skuId ?? null,
      JSON.stringify({
        name,
        quantity,
        phone,
        notes: notes || undefined,
      }),
      null,
      null,
      createdAt,
      createdAt,
    )

    if (mediaRows.length) {
      const insertMedia = db.prepare(
        "INSERT INTO media (id, type, url, name, size, mime_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      const link = db.prepare(
        "INSERT INTO inquiry_attachment (inquiry_id, media_id) VALUES (?, ?)",
      )

      for (const m of mediaRows) {
        insertMedia.run(m.id, "file", m.url, m.name, m.size ?? null, m.mimeType ?? null, createdAt)
        link.run(inquiryId, m.id)
      }
    }
  })()

  res.json({
    success: true,
    data: { id: inquiryId, status: "new", createdAt },
  })
})

export default router
