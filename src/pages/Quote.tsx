import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import SiteShell from "@/components/SiteShell"
import type { UploadedAsset } from "@/components/FileUpload"
import { apiFetch } from "@/lib/api"
import QuoteMainCard from "@/pages/quote/QuoteMainCard"
import QuoteSidebar from "@/pages/quote/QuoteSidebar"
import type { ProductDetailLite } from "@/pages/quote/types"
import { buildSkuTotalRange } from "@/pages/quote/types"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function Quote() {
  const [search] = useSearchParams()
  const type = (search.get("type") || "service") as "service" | "product"
  const skuId = search.get("skuId") || ""
  const productId = search.get("productId") || ""

  const isService = type === "service"
  const isProduct = type === "product"

  usePageTitle(isService ? "代打服务询价" : "平台产品询价")

  const [product, setProduct] = useState<ProductDetailLite | null>(null)
  const [productLoading, setProductLoading] = useState(false)
  const [productError, setProductError] = useState<string | null>(null)
  const sku = useMemo(() => product?.skus?.find((s) => s.id === skuId) || null, [product, skuId])

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [quantity, setQuantity] = useState<number>(1)
  const [notes, setNotes] = useState("")
  const [attachments, setAttachments] = useState<UploadedAsset[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okId, setOkId] = useState<string | null>(null)

  useEffect(() => {
    setOkId(null)
    setError(null)
    setProductError(null)
  }, [type, skuId, productId])

  useEffect(() => {
    if (!isProduct) return
    if (!productId) return
    setProductError(null)
    setProductLoading(true)
    apiFetch<ProductDetailLite>(`/api/products/${productId}`)
      .then((p) => {
        setProduct(p)
        setProductLoading(false)
      })
      .catch(() => {
        setProduct(null)
        setProductError("产品不存在或不可用")
        setProductLoading(false)
      })
  }, [isProduct, productId])

  const priceRange = useMemo(() => {
    if (!isProduct || !sku) return null
    return buildSkuTotalRange(sku, quantity)
  }, [isProduct, quantity, sku])

  const priceText = useMemo(() => {
    if (isService) return "价格面议"
    if (!productId) return "缺少 productId"
    if (!skuId) return "请选择 SKU"
    if (productError) return productError
    if (productLoading) return "正在加载 SKU…"
    if (!sku) return "SKU 无效或不属于该产品"
    if (!priceRange) return "价格面议"
    return ""
  }, [isService, priceRange, productError, productId, productLoading, sku, skuId])

  const validationError = useMemo(() => {
    if (!name.trim()) return "请填写姓名"
    const phoneValue = phone.trim()
    if (!phoneValue) return "请填写电话"
    if (quantity < 1 || !Number.isFinite(quantity)) return "数量必须为正整数"
    if (isProduct && !productId) return "缺少 productId"
    if (isProduct && !skuId) return "请选择产品 SKU"
    if (isProduct && productError) return productError
    if (isProduct && productLoading) return "正在加载产品信息…"
    if (isProduct && product && skuId && !sku) return "SKU 无效或不属于该产品"
    return null
  }, [isProduct, name, phone, product, productError, productId, productLoading, quantity, sku, skuId])

  const canSubmit = useMemo(() => {
    return validationError == null
  }, [validationError])

  async function onSubmit() {
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError(null)
    setOkId(null)
    try {
      const data = await apiFetch<{ id: string; status: string; createdAt: string }>("/api/inquiries", {
        method: "POST",
        body: JSON.stringify({
          inquiryType: isService ? "service_print" : "platform_product",
          productId: isProduct ? productId : undefined,
          skuId: isProduct ? skuId : undefined,
          name,
          phone: phone || undefined,
          quantity,
          notes: notes || undefined,
          attachments: isService ? attachments : [],
        }),
      })
      setOkId(data.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mt-6 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <QuoteMainCard
              type={type}
              backTo={isProduct ? "/work" : "/service/print"}
              title={isService ? "代打服务询价" : "平台产品询价"}
              subtitle={
                isService
                  ? "代打服务：可选上传模型文件，提交后由工程师评估报价。"
                  : "平台产品：选择 SKU 与数量后提交询价，不需要上传文件。"
              }
              productTitle={product?.title}
              skuCode={sku?.skuCode}
              skuAttrsText={
                sku
                  ? Object.entries(sku.attributes || {})
                      .slice(0, 4)
                      .map(([k, v]) => `${k}:${v}`)
                      .join(" · ")
                  : skuId
                    ? "正在加载SKU信息…"
                    : "缺少 skuId"
              }
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              quantity={quantity}
              setQuantity={setQuantity}
              notes={notes}
              setNotes={setNotes}
              attachments={attachments}
              setAttachments={setAttachments}
              error={error}
              okId={okId}
            />
          </div>

          <div className="md:col-span-5">
            <QuoteSidebar
              priceRange={priceRange}
              priceText={priceText}
              onSubmit={onSubmit}
              canSubmit={canSubmit}
              submitting={submitting}
              productReady={!isProduct || (!productLoading && Boolean(sku))}
            />
          </div>
        </div>
      </div>
    </SiteShell>
  )
}
