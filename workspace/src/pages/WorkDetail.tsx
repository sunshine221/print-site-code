import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react"
import SiteShell from "@/components/SiteShell"
import { apiFetch } from "@/lib/api"
import { useAsync } from "@/hooks/useAsync"
import { cn } from "@/lib/utils"

type ProductDetail = {
  id: string
  title: string
  summary: string
  process?: string | null
  material?: string | null
  leadTimeDays?: number | null
  priceHint?: string | null
  tags: Array<{ group: string; name: string }>
  skus: Array<{
    id: string
    skuCode: string
    attributes: Record<string, string>
    priceMin?: number | null
    priceMax?: number | null
    currency?: string | null
    stockQty?: number | null
    published: boolean
  }>
  media: Array<{ id: string; type: string; url: string; name: string; sortOrder: number }>
}

export default function WorkDetail() {
  const params = useParams()
  const id = String(params.id || "")
  const detail = useAsync(() => apiFetch<ProductDetail>(`/api/products/${id}`), [id])
  const [skuId, setSkuId] = useState<string>("")

  const sku = useMemo(() => {
    const skus = detail.data?.skus || []
    if (!skus.length) return null
    const picked = skus.find((s) => s.id === skuId) || skus[0]
    return picked
  }, [detail.data?.skus, skuId])

  const cover = detail.data?.media?.[0]?.url

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <Link to="/work" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-zinc-50">
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Link>
        </div>

        {detail.loading ? (
          <div className="mt-6 grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="aspect-[4/3] animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/30" />
            </div>
            <div className="md:col-span-5">
              <div className="h-64 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/30" />
            </div>
          </div>
        ) : detail.error ? (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-rose-300">
            {detail.error}
          </div>
        ) : !detail.data ? null : (
          <div className="mt-6 grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                <div className="aspect-[4/3] bg-zinc-900">
                  {cover ? (
                    <img src={cover} alt={detail.data.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
                  )}
                </div>
                {detail.data.media.length > 1 ? (
                  <div className="grid grid-cols-4 gap-2 border-t border-zinc-800 p-3">
                    {detail.data.media.slice(0, 4).map((m) => (
                      <div key={m.id} className="aspect-[4/3] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                        <img src={m.url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-2xl font-semibold text-zinc-50">{detail.data.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-zinc-300">{detail.data.summary}</div>

                <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                  {detail.data.process ? (
                    <span className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1">
                      工艺 {detail.data.process}
                    </span>
                  ) : null}
                  {detail.data.leadTimeDays ? (
                    <span className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1">
                      交期 {detail.data.leadTimeDays} 天
                    </span>
                  ) : null}
                  {detail.data.priceHint ? (
                    <span className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1">
                      {detail.data.priceHint}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold text-zinc-50">选择 SKU</div>
                  <div className="mt-3 space-y-2">
                    {(detail.data.skus || []).map((s) => {
                      const selected = sku?.id === s.id
                      const min = s.priceMin ?? null
                      const max = s.priceMax ?? null
                      const price =
                        min != null && max != null ? `${min}–${max}` : min != null ? `${min}+` : "询价"
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSkuId(s.id)}
                          className={cn(
                            "w-full rounded-xl border px-3 py-3 text-left transition",
                            selected
                              ? "border-zinc-600 bg-zinc-900/40"
                              : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900/30",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-zinc-50">
                                {s.skuCode}
                              </div>
                              <div className="mt-1 line-clamp-2 text-xs text-zinc-400">
                                {Object.entries(s.attributes || {})
                                  .slice(0, 3)
                                  .map(([k, v]) => `${k}:${v}`)
                                  .join(" · ")}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
                              {price}
                              <span className="text-[11px] text-zinc-400">元</span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    产品询价不需要上传文件
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    提交后可在后台跟进线索与报价状态。
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={`/quote?type=product&skuId=${encodeURIComponent(sku?.id || "")}&productId=${encodeURIComponent(
                      detail.data.id,
                    )}`}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition",
                      sku?.id
                        ? "bg-zinc-50 text-zinc-950 hover:bg-white"
                        : "pointer-events-none bg-zinc-800 text-zinc-400",
                    )}
                  >
                    立即询价
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/quote?type=service"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900"
                  >
                    我要代打服务
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  )
}

