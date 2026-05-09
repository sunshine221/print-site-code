import { useState } from "react"
import { Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"
import { usePageTitle } from "@/hooks/usePageTitle"

type PricingRule = {
  id: string
  name: string
  version: string
  enabled: boolean
  createdAt: string
}

export default function AdminPricing() {
  usePageTitle("后台 · 报价规则")

  const token = useAuthStore((s) => s.token) || ""
  const [refreshKey, setRefreshKey] = useState(0)
  const list = useAsync(() => apiFetch<PricingRule[]>("/api/admin/pricing", { token }), [token, refreshKey])

  async function enable(id: string) {
    await apiFetch("/api/admin/pricing/" + encodeURIComponent(id) + "/enable", { method: "POST", token })
    setRefreshKey((v) => v + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">报价规则</div>
          <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">支持规则新增、编辑、删除与启用。</div>
        </div>
        <Link
          to="/admin/pricing/new"
          className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          新增规则
        </Link>
      </div>

      {list.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
          {(list.data || []).map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{r.name}</div>
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
                      {r.version}
                    </span>
                    {r.enabled ? (
                      <span className="rounded-md border border-emerald-900/60 bg-emerald-950/20 px-2 py-0.5 text-[11px] text-emerald-200">
                        已启用
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/pricing/${encodeURIComponent(r.id)}/edit`}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  >
                    <Pencil className="h-4 w-4" />
                    编辑
                  </Link>
                  <button
                    type="button"
                    disabled={r.enabled}
                    onClick={() => enable(r.id)}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    启用
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = window.confirm("确认删除该规则？")
                      if (!ok) return
                      await apiFetch(`/api/admin/pricing/${encodeURIComponent(r.id)}`, { method: "DELETE", token })
                      setRefreshKey((v) => v + 1)
                    }}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300 dark:hover:bg-zinc-900"
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
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
