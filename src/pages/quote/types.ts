export type QuoteEstimate = {
  currency: "CNY" | "USD"
  priceMin: number
  priceMax: number
  ruleVersion?: string
  disclaimer: string
}

export type ProductDetailLite = {
  id: string
  title: string
  skus: Array<{ id: string; skuCode: string; attributes: Record<string, string> }>
}

export function formatRange(e: QuoteEstimate | null) {
  if (!e) return ""
  return `${e.priceMin}–${e.priceMax} ${e.currency}`
}

