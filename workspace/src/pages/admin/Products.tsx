import { useMemo } from "react"
import { ArrowUpRight, Package } from "lucide-react"
import { Link } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"

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
  const token = useAuthStore((s) => s.token) || ""
  const list = useAsync(() => apiFetch<ProductItem[]>("/api/admin/products", { token }), [token])

  const featuredCount = useMemo(
    () => (list.data || []).filter((p) => p.featured).length,
    [list.data],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-zinc-50">产品管理</div>
          <div className="mt-2 text-sm text-zinc-400">当前精选 {featuredCount} 个</div>
        </div>
        <Link
          to="/work"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
        >
          <Package className="h-4 w-4" />
          查看前台
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {list.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30" />
          ))}
        </div>
      ) : list.error ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-rose-300">
          {list.error}
        </div>
      ) : (
        <div className="space-y-2">
          {(list.data || []).map((p) => (
            <div key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-50">{p.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-zinc-400">{p.summary}</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                    {p.process ? (
                      <span className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1">
                        工艺 {p.process}
                      </span>
                    ) : null}
                    <span className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1">
                      {p.published ? "已发布" : "未发布"}
                    </span>
                    {p.featured ? (
                      <span className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1">
                        精选
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">{new Date(p.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

