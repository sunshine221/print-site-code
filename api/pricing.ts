import type Database from "better-sqlite3"

export type QuoteEstimateRequest = {
  skuId?: string
  quantity?: number
  processPreference?: string
  materialPreference?: string
  precisionPreference?: string
  leadTimePreference?: string
  modelMetrics?: {
    volumeCm3?: number
    boundingBoxMm?: { x: number; y: number; z: number }
  }
}

export type QuoteEstimateResponse = {
  currency: "CNY" | "USD"
  priceMin: number
  priceMax: number
  ruleVersion?: string
  disclaimer: string
}

export function loadActivePricingRule(db: Database.Database) {
  const row = db
    .prepare(
      "SELECT version, rule_json FROM pricing_rule WHERE enabled = 1 ORDER BY created_at DESC LIMIT 1",
    )
    .get() as any
  if (!row?.version) return null
  return { version: row.version as string, rule: JSON.parse(row.rule_json || "{}") as any }
}

function clampRange(min: number, max: number) {
  const a = Number.isFinite(min) ? min : 0
  const b = Number.isFinite(max) ? max : 0
  if (a <= b) return { min: a, max: b }
  return { min: b, max: a }
}

export function estimateQuote(db: Database.Database, req: QuoteEstimateRequest): QuoteEstimateResponse {
  const active = loadActivePricingRule(db)
  const currency = (active?.rule?.baseCurrency || "CNY") as "CNY" | "USD"
  const disclaimer = "预估报价仅供参考，最终价格以工程评估与报价单为准。"

  const quantity = Math.max(1, Number(req.quantity || 1))

  if (req.skuId) {
    const sku = db
      .prepare(
        `SELECT price_min as priceMin, price_max as priceMax, currency
         FROM product_sku WHERE id = ?`,
      )
      .get(req.skuId) as any

    if (sku?.priceMin != null || sku?.priceMax != null) {
      const baseMin = Number(sku.priceMin ?? sku.priceMax ?? 0)
      const baseMax = Number(sku.priceMax ?? sku.priceMin ?? 0)
      const range = clampRange(baseMin, baseMax)
      return {
        currency: (sku.currency || currency) as any,
        priceMin: Math.round(range.min * quantity),
        priceMax: Math.round(range.max * quantity),
        ruleVersion: active?.version,
        disclaimer,
      }
    }
  }

  const base = active?.rule?.service?.baseMin != null ? Number(active.rule.service.baseMin) : 120
  const baseMax = active?.rule?.service?.baseMax != null ? Number(active.rule.service.baseMax) : 260
  let min = base
  let max = baseMax

  const process = String(req.processPreference || "").trim()
  const material = String(req.materialPreference || "").trim()
  const precision = String(req.precisionPreference || "").trim()
  const leadTime = String(req.leadTimePreference || "").trim()

  const pm = active?.rule?.service?.processMultiplier?.[process]
  if (pm) {
    min *= Number(pm)
    max *= Number(pm)
  }

  if (material) {
    const mm = active?.rule?.service?.materialMultiplier?.[material]
    if (mm) {
      min *= Number(mm)
      max *= Number(mm)
    }
  }

  if (precision) {
    const precisionMultiplier = active?.rule?.service?.precisionMultiplier
    if (precisionMultiplier) {
      min *= Number(precisionMultiplier)
      max *= Number(precisionMultiplier)
    }
  }

  if (leadTime) {
    const rushMultiplier = active?.rule?.service?.rushMultiplier
    const isRush = leadTime.includes("加急") || leadTime.includes("1") || leadTime.includes("2")
    if (isRush && rushMultiplier) {
      min *= Number(rushMultiplier)
      max *= Number(rushMultiplier)
    }
  }

  const volume = Number(req.modelMetrics?.volumeCm3 || 0)
  if (Number.isFinite(volume) && volume > 0) {
    const factor = Math.min(6, Math.max(1, volume / 20))
    min *= factor
    max *= factor
  }

  const range = clampRange(min, max)
  return {
    currency,
    priceMin: Math.round(range.min * quantity),
    priceMax: Math.round(range.max * quantity),
    ruleVersion: active?.version,
    disclaimer,
  }
}

