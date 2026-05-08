import { useMemo, useState } from "react"
import { ArrowUpRight, Package, Pencil, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"
import { usePageTitle } from "@/hooks/usePageTitle"

type ProductItem = {
  id: string
  title: string
  summary: string
  process?: string | null
  material?: string | null
  featured: boolean
  published: boolean
  updatedAt: string
}

export default function AdminProducts() {
  usePageTitle("后台 · 产品管理")

  const token = useAuthStore((s) => s.token) || ""
  const [refreshKey, setRefreshKey] = useState(0)
  const list = useAsync(() => apiFetch<ProductItem[]>("/api/admin/products", { token }), [token, refreshKey])

  const featuredCount = useMemo(
    () => (list.data || []).filter((p) => p.featured).length,
    [list.data],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">产品管理</div>
          <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">当前精选 {featuredCount} 个</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
          >
            <Plus className="h-4 w-4" />
            新增产品
          </Link>
          <Link
            to="/work"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            <Package className="h-4 w-4" />
            查看前台
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {list.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30"
            />
          ))}
        </div>
      ) : list.error ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300">
          {list.error}
        </div>
      ) : (
        <div className="space-y-2">
          {(list.data || []).map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{p.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{p.summary}</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {p.process ? (
                      <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                        工艺 {p.process}
                      </span>
                    ) : null}
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                      {p.published ? "已发布" : "未发布"}
                    </span>
                    {p.featured ? (
                      <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                        精选
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-zinc-500">{new Date(p.updatedAt).toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/products/${encodeURIComponent(p.id)}/edit`}
                      className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                    >
                      <Pencil className="h-4 w-4" />
                      编辑
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = window.confirm("确认删除该产品？")
                        if (!ok) return
                        await apiFetch(`/api/admin/products/${encodeURIComponent(p.id)}`, { method: "DELETE", token })
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
