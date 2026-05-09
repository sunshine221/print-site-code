import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import SiteShell from "@/components/SiteShell"
import type { UploadedAsset } from "@/components/FileUpload"
import { apiFetch } from "@/lib/api"
import QuoteMainCard from "@/pages/quote/QuoteMainCard"
import QuoteSidebar from "@/pages/quote/QuoteSidebar"
import type { ProductDetailLite, QuoteEstimate } from "@/pages/quote/types"
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
  const sku = useMemo(() => product?.skus?.find((s) => s.id === skuId) || null, [product, skuId])

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [quantity, setQuantity] = useState<number>(1)
  const [processPreference, setProcessPreference] = useState("")
  const [materialPreference, setMaterialPreference] = useState("")
  const [precisionPreference, setPrecisionPreference] = useState("")
  const [leadTimePreference, setLeadTimePreference] = useState("")
  const [notes, setNotes] = useState("")
  const [attachments, setAttachments] = useState<UploadedAsset[]>([])

  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okId, setOkId] = useState<string | null>(null)

  useEffect(() => {
    setEstimate(null)
    setOkId(null)
    setError(null)
  }, [type, skuId, productId])

  useEffect(() => {
    if (!isProduct) return
    if (!productId) return
    apiFetch<ProductDetailLite>(`/api/products/${productId}`)
      .then(setProduct)
      .catch(() => setProduct(null))
  }, [isProduct, productId])

  const validationError = useMemo(() => {
    if (!name.trim()) return "请填写姓名"
    const emailValue = email.trim()
    const phoneValue = phone.trim()
    if (!emailValue && !phoneValue) return "邮箱或电话至少填写一项"
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return "邮箱格式不正确"
    if (quantity < 1 || !Number.isFinite(quantity)) return "数量必须为正整数"
    if (isProduct && !skuId) return "请选择产品 SKU"
    if (isService && attachments.length === 0) return "代打服务需要上传模型文件"
    return null
  }, [attachments.length, email, isProduct, isService, name, phone, quantity, skuId])

  const canSubmit = useMemo(() => {
    return validationError == null
  }, [validationError])

  async function doEstimate() {
    setError(null)
    const data = await apiFetch<QuoteEstimate>("/api/quote/estimate", {
      method: "POST",
      body: JSON.stringify({
        skuId: isProduct ? skuId : undefined,
        quantity,
        processPreference: processPreference || undefined,
        materialPreference: materialPreference || undefined,
        precisionPreference: precisionPreference || undefined,
        leadTimePreference: leadTimePreference || undefined,
      }),
    })
    setEstimate(data)
  }

  async function onSubmit() {
    if (validationError) {
      setError(validationError)
      return
    }
    setSubmitting(true)
    setError(null)
    setOkId(null)
    try {
      const data = await apiFetch<{ id: string; status: string; createdAt: string; quoteEstimate: QuoteEstimate }>(
        "/api/inquiries",
        {
          method: "POST",
          body: JSON.stringify({
            inquiryType: isService ? "service_print" : "platform_product",
            productId: isProduct ? productId : undefined,
            skuId: isProduct ? skuId : undefined,
            name,
            email: email.trim() || undefined,
            phone: phone || undefined,
            company: company || undefined,
            quantity,
            processPreference: processPreference || undefined,
            materialPreference: materialPreference || undefined,
            precisionPreference: precisionPreference || undefined,
            leadTimePreference: leadTimePreference || undefined,
            notes: notes || undefined,
            attachments: isService ? attachments : [],
          }),
        },
      )
      setOkId(data.id)
      setEstimate(data.quoteEstimate)
    } catch (e: any) {
      setError(String(e?.message || e))
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
                  ? "代打服务：需要上传模型文件。上传并填写需求后获取预估报价区间。"
                  : "平台产品：选择现有产品并提交询价，不需要上传文件。"
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
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              company={company}
              setCompany={setCompany}
              quantity={quantity}
              setQuantity={setQuantity}
              processPreference={processPreference}
              setProcessPreference={setProcessPreference}
              materialPreference={materialPreference}
              setMaterialPreference={setMaterialPreference}
              precisionPreference={precisionPreference}
              setPrecisionPreference={setPrecisionPreference}
              leadTimePreference={leadTimePreference}
              setLeadTimePreference={setLeadTimePreference}
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
              estimate={estimate}
              onEstimate={doEstimate}
              onSubmit={onSubmit}
              canSubmit={canSubmit}
              submitting={submitting}
              productReady={!isProduct || Boolean(sku)}
            />
          </div>
        </div>
      </div>
    </SiteShell>
  )
}
