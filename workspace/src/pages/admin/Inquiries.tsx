import { useMemo, useState } from "react"
import { ArrowUpRight, ClipboardList } from "lucide-react"
import { Link } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"
import { usePageTitle } from "@/hooks/usePageTitle"

type InquiryItem = {
  id: string
  status: string
  inquiryType: string
  request: { name: string; email: string; notes?: string }
  quoteEstimate?: { priceMin: number; priceMax: number; currency: string } | null
  createdAt: string
}

const statuses = [
  { value: "new", label: "新建" },
  { value: "processing", label: "处理中" },
  { value: "quoted", label: "已报价" },
  { value: "closed", label: "已关闭" },
]

export default function AdminInquiries() {
  usePageTitle("后台 · 询价管理")

  const token = useAuthStore((s) => s.token) || ""
  const [refreshKey, setRefreshKey] = useState(0)
  const list = useAsync(() => apiFetch<InquiryItem[]>("/api/admin/inquiries", { token }), [token, refreshKey])

  const byType = useMemo(() => {
    const items = list.data || []
    const service = items.filter((i) => i.inquiryType === "service_print").length
    const product = items.filter((i) => i.inquiryType === "platform_product").length
    return { service, product }
  }, [list.data])

  async function updateStatus(id: string, status: string) {
    await apiFetch("/api/admin/inquiries/" + encodeURIComponent(id), {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    })
    setRefreshKey((v) => v + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">询价管理</div>
          <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            代打 {byType.service} · 产品 {byType.product}
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          <ClipboardList className="h-4 w-4" />
          最近 200 条
        </div>
      </div>

      {list.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30"
            />
          ))}
        </div>
      ) : list.error ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300">
          {list.error}
        </div>
      ) : (
        <div className="space-y-2">
          {(list.data || []).map((i) => (
            <div
              key={i.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{i.request.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{i.request.email}</div>
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                      {i.inquiryType === "service_print" ? "代打" : "产品"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    {new Date(i.createdAt).toLocaleString()} · 订单编号 {i.id}
                  </div>
                  {i.quoteEstimate ? (
                    <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      预估 {i.quoteEstimate.priceMin}–{i.quoteEstimate.priceMax} {i.quoteEstimate.currency}
                    </div>
                  ) : null}
                  {i.request.notes ? (
                    <div className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{i.request.notes}</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={i.status}
                    onChange={(e) => updateStatus(i.id, e.target.value)}
                    className="rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-700"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <Link
                    to={`/admin/inquiries/${encodeURIComponent(i.id)}`}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  >
                    查看详情
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(i.id)}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  >
                    复制ID
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
