import { Router, type Request, type Response } from "express"
import { nanoid } from "nanoid"
import { getDb } from "../context.js"
import { estimateQuote } from "../pricing.js"

const router = Router()

function nowIso() {
  return new Date().toISOString()
}

function normalizeEmail(v: any) {
  return String(v || "").trim().toLowerCase()
}

router.post("/", (req: Request, res: Response) => {
  const body = req.body || {}
  const inquiryType = String(body.inquiryType || "")

  const name = String(body.name || "").trim()
  const email = normalizeEmail(body.email)
  const phone = String(body.phone || "").trim()
  const company = String(body.company || "").trim()
  const useCase = String(body.useCase || "").trim()
  const quantity = body.quantity != null ? Number(body.quantity) : undefined
  const materialPreference = String(body.materialPreference || "").trim()
  const processPreference = String(body.processPreference || "").trim()
  const precisionPreference = String(body.precisionPreference || "").trim()
  const leadTimePreference = String(body.leadTimePreference || "").trim()
  const notes = String(body.notes || "").trim()
  const skuId = body.skuId ? String(body.skuId) : undefined
  const productId = body.productId ? String(body.productId) : undefined

  if (!name || !email) {
    res.status(400).json({ success: false, error: "Missing required fields" })
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
  if (inquiryType === "service_print" && attachments.length === 0) {
    res.status(400).json({ success: false, error: "Attachment required for service_print" })
    return
  }

  const db = getDb()

  let resolvedProductId = productId
  if (!resolvedProductId && skuId) {
    const sku = db
      .prepare("SELECT product_id as productId FROM product_sku WHERE id = ?")
      .get(skuId) as any
    if (sku?.productId) resolvedProductId = sku.productId
  }

  const estimate = estimateQuote(db, {
    skuId,
    quantity,
    processPreference,
    materialPreference,
    precisionPreference,
    leadTimePreference,
    modelMetrics: body.modelMetrics,
  })

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
    if (mediaRows.length === 0) {
      res.status(400).json({ success: false, error: "Attachment required for service_print" })
      return
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
        email,
        phone: phone || undefined,
        company: company || undefined,
        useCase: useCase || undefined,
        quantity,
        materialPreference: materialPreference || undefined,
        processPreference: processPreference || undefined,
        precisionPreference: precisionPreference || undefined,
        leadTimePreference: leadTimePreference || undefined,
        notes: notes || undefined,
      }),
      JSON.stringify(estimate),
      estimate.ruleVersion ?? null,
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
    data: { id: inquiryId, status: "new", quoteEstimate: estimate, createdAt },
  })
})

export default router

