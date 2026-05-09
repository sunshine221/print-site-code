export type ProductDetailLite = {
  id: string
  title: string
  skus: Array<{
    id: string
    skuCode: string
    attributes: Record<string, string>
    priceMin?: number | null
    priceMax?: number | null
    currency?: string | null
  }>
}

export type MoneyRange = {
  currency: string
  priceMin: number
  priceMax: number
}

function clampRange(min: number, max: number) {
  const a = Number.isFinite(min) ? min : 0
  const b = Number.isFinite(max) ? max : 0
  if (a <= b) return { min: a, max: b }
  return { min: b, max: a }
}

export function buildSkuTotalRange(
  sku: ProductDetailLite["skus"][number],
  quantity: number,
): MoneyRange | null {
  const q = Math.max(1, Number(quantity || 1))
  const baseMin = sku.priceMin ?? sku.priceMax
  const baseMax = sku.priceMax ?? sku.priceMin
  if (baseMin == null && baseMax == null) return null
  const range = clampRange(Number(baseMin ?? 0), Number(baseMax ?? 0))
  return {
    currency: String(sku.currency || "CNY"),
    priceMin: Math.round(range.min * q),
    priceMax: Math.round(range.max * q),
  }
}

export function formatMoneyRange(r: MoneyRange) {
  return `${r.priceMin}–${r.priceMax} ${r.currency}`
}
