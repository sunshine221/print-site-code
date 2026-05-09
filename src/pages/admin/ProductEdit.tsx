import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"
import { usePageTitle } from "@/hooks/usePageTitle"

type ProductSku = {
  id: string
  skuCode: string
  attributes: Record<string, string>
  priceMin?: number | null
  priceMax?: number | null
  currency?: string | null
  stockQty?: number | null
  published: boolean
}

type ProductDetail = {
  id: string
  title: string
  summary: string
  process?: string | null
  material?: string | null
  leadTimeDays?: number | null
  priceHint?: string | null
  featured: boolean
  published: boolean
  skus: ProductSku[]
}

type SkuDraft = {
  id: string
  skuCode: string
  attributesText: string
  priceMin: string
  priceMax: string
  stockQty: string
  published: boolean
  saving?: boolean
}

function toNumOrNull(v: string) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default function AdminProductEdit() {
  const token = useAuthStore((s) => s.token) || ""
  const params = useParams()
  const productId = params.id ? String(params.id) : ""
  const isNew = !productId
  const navigate = useNavigate()

  usePageTitle(isNew ? "后台 · 新增产品" : `后台 · 编辑产品`)

  const detail = useAsync(
    () => (productId ? apiFetch<ProductDetail>(`/api/admin/products/${encodeURIComponent(productId)}`, { token }) : null),
    [productId, token],
  )

  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [process, setProcess] = useState("")
  const [material, setMaterial] = useState("")
  const [leadTimeDays, setLeadTimeDays] = useState("")
  const [priceHint, setPriceHint] = useState("")
  const [featured, setFeatured] = useState(false)
  const [published, setPublished] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skus, setSkus] = useState<SkuDraft[]>([])

  useEffect(() => {
    const d = detail.data
    if (!d) return
    setTitle(d.title || "")
    setSummary(d.summary || "")
    setProcess(d.process || "")
    setMaterial(d.material || "")
    setLeadTimeDays(d.leadTimeDays != null ? String(d.leadTimeDays) : "")
    setPriceHint(d.priceHint || "")
    setFeatured(Boolean(d.featured))
    setPublished(Boolean(d.published))
    setSkus(
      (d.skus || []).map((s) => ({
        id: s.id,
        skuCode: s.skuCode,
        attributesText: JSON.stringify(s.attributes || {}, null, 2),
        priceMin: s.priceMin != null ? String(s.priceMin) : "",
        priceMax: s.priceMax != null ? String(s.priceMax) : "",
        stockQty: s.stockQty != null ? String(s.stockQty) : "",
        published: Boolean(s.published),
      })),
    )
  }, [detail.data])

  const canSaveProduct = useMemo(() => Boolean(title.trim() && summary.trim()), [summary, title])

  async function saveProduct() {
    if (!canSaveProduct) return
    setBusy(true)
    setError(null)
    try {
      if (isNew) {
        const created = await apiFetch<{ id: string }>("/api/admin/products", {
          method: "POST",
          token,
          body: JSON.stringify({
            title: title.trim(),
            summary: summary.trim(),
            process: process.trim() || null,
            material: material.trim() || null,
            leadTimeDays: leadTimeDays.trim() ? Number(leadTimeDays) : null,
            priceHint: priceHint.trim() || null,
            featured,
            published,
          }),
        })
        navigate(`/admin/products/${encodeURIComponent(created.id)}/edit`, { replace: true })
        return
      }

      await apiFetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          process: process.trim() || null,
          material: material.trim() || null,
          leadTimeDays: leadTimeDays.trim() ? Number(leadTimeDays) : null,
          priceHint: priceHint.trim() || null,
          featured,
          published,
        }),
      })
      navigate("/admin/products", { replace: true })
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  async function deleteProduct() {
    if (isNew) return
    const ok = window.confirm("确认删除该产品？")
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await apiFetch(`/api/admin/products/${encodeURIComponent(productId)}`, { method: "DELETE", token })
      navigate("/admin/products", { replace: true })
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  function addSku() {
    setSkus((prev) => [
      ...prev,
      {
        id: `new_${Math.random().toString(36).slice(2)}`,
        skuCode: "",
        attributesText: "{}",
        priceMin: "",
        priceMax: "",
        stockQty: "",
        published: true,
      },
    ])
  }

  async function saveSku(row: SkuDraft) {
    if (isNew) return
    const skuCode = row.skuCode.trim()
    if (!skuCode) {
      setError("SKU 编码不能为空")
      return
    }
    let attrs: any = {}
    try {
      attrs = row.attributesText.trim() ? JSON.parse(row.attributesText) : {}
    } catch {
      setError("SKU 属性必须为合法 JSON")
      return
    }

    setSkus((prev) => prev.map((s) => (s.id === row.id ? { ...s, saving: true } : s)))
    setError(null)
    try {
      if (row.id.startsWith("new_")) {
        const created = await apiFetch<{ id: string }>(
          `/api/admin/products/${encodeURIComponent(productId)}/skus`,
          {
            method: "POST",
            token,
            body: JSON.stringify({
              skuCode,
              attributes: attrs,
              priceMin: row.priceMin.trim() ? toNumOrNull(row.priceMin) : null,
              priceMax: row.priceMax.trim() ? toNumOrNull(row.priceMax) : null,
              stockQty: row.stockQty.trim() ? toNumOrNull(row.stockQty) : null,
              published: row.published,
            }),
          },
        )
        setSkus((prev) => prev.map((s) => (s.id === row.id ? { ...row, id: created.id, saving: false } : s)))
      } else {
        await apiFetch(
          `/api/admin/products/${encodeURIComponent(productId)}/skus/${encodeURIComponent(row.id)}`,
          {
            method: "PATCH",
            token,
            body: JSON.stringify({
              skuCode,
              attributes: attrs,
              priceMin: row.priceMin.trim() ? toNumOrNull(row.priceMin) : null,
              priceMax: row.priceMax.trim() ? toNumOrNull(row.priceMax) : null,
              stockQty: row.stockQty.trim() ? toNumOrNull(row.stockQty) : null,
              published: row.published,
            }),
          },
        )
        setSkus((prev) => prev.map((s) => (s.id === row.id ? { ...row, saving: false } : s)))
      }
    } catch (e: any) {
      setError(String(e?.message || e))
      setSkus((prev) => prev.map((s) => (s.id === row.id ? { ...s, saving: false } : s)))
    }
  }

  async function deleteSku(id: string) {
    if (isNew) return
    const ok = window.confirm("确认删除该 SKU？")
    if (!ok) return
    setError(null)
    try {
      if (id.startsWith("new_")) {
        setSkus((prev) => prev.filter((s) => s.id !== id))
        return
      }
      await apiFetch(`/api/admin/products/${encodeURIComponent(productId)}/skus/${encodeURIComponent(id)}`, {
        method: "DELETE",
        token,
      })
      setSkus((prev) => prev.filter((s) => s.id !== id))
    } catch (e: any) {
      setError(String(e?.message || e))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          返回产品列表
        </Link>

        <div className="flex items-center gap-2">
          {!isNew ? (
            <button
              type="button"
              onClick={deleteProduct}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300 dark:hover:bg-zinc-900"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          ) : null}
          <button
            type="button"
            onClick={saveProduct}
            disabled={!canSaveProduct || busy}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
          >
            <Save className="h-4 w-4" />
            保存
          </button>
        </div>
      </div>

      {detail.loading ? (
        <div className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30" />
      ) : detail.error ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300">
          {detail.error}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">基础信息</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">标题</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">摘要</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">工艺</label>
            <input
              value={process}
              onChange={(e) => setProcess(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">材料</label>
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">交期（天）</label>
            <input
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">价格提示</label>
            <input
              value={priceHint}
              onChange={(e) => setPriceHint(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4"
              />
              精选
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4"
              />
              已发布
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">SKU</div>
          <button
            type="button"
            onClick={addSku}
            disabled={isNew}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            新增 SKU
          </button>
        </div>
        {isNew ? (
          <div className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">请先保存产品后再新增 SKU。</div>
        ) : null}
        <div className="mt-4 space-y-3">
          {skus.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-4">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400">SKU 编码</label>
                  <input
                    value={s.skuCode}
                    onChange={(e) =>
                      setSkus((prev) => prev.map((x) => (x.id === s.id ? { ...x, skuCode: e.target.value } : x)))
                    }
                    className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400">最低价</label>
                  <input
                    value={s.priceMin}
                    onChange={(e) =>
                      setSkus((prev) => prev.map((x) => (x.id === s.id ? { ...x, priceMin: e.target.value } : x)))
                    }
                    className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400">最高价</label>
                  <input
                    value={s.priceMax}
                    onChange={(e) =>
                      setSkus((prev) => prev.map((x) => (x.id === s.id ? { ...x, priceMax: e.target.value } : x)))
                    }
                    className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400">库存</label>
                  <input
                    value={s.stockQty}
                    onChange={(e) =>
                      setSkus((prev) => prev.map((x) => (x.id === s.id ? { ...x, stockQty: e.target.value } : x)))
                    }
                    className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
                  />
                </div>
                <div className="md:col-span-2 flex items-end justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={s.published}
                      onChange={(e) =>
                        setSkus((prev) => prev.map((x) => (x.id === s.id ? { ...x, published: e.target.checked } : x)))
                      }
                      className="h-4 w-4"
                    />
                    上架
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveSku(s)}
                      disabled={Boolean(s.saving) || isNew}
                      className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSku(s.id)}
                      className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300 dark:hover:bg-zinc-900"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="md:col-span-12">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400">属性（JSON）</label>
                  <textarea
                    value={s.attributesText}
                    onChange={(e) =>
                      setSkus((prev) =>
                        prev.map((x) => (x.id === s.id ? { ...x, attributesText: e.target.value } : x)),
                      )
                    }
                    rows={3}
                    className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
                  />
                </div>
              </div>
            </div>
          ))}
          {!skus.length ? <div className="text-sm text-zinc-500 dark:text-zinc-400">暂无 SKU</div> : null}
        </div>
      </div>
    </div>
  )
}
