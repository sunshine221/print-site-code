import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"

type PricingRule = {
  id: string
  name: string
  version: string
  enabled: boolean
  createdAt: string
}

export default function AdminPricing() {
  const token = useAuthStore((s) => s.token) || ""
  const [refreshKey, setRefreshKey] = useState(0)
  const list = useAsync(() => apiFetch<PricingRule[]>("/api/admin/pricing", { token }), [token, refreshKey])

  async function enable(id: string) {
    await apiFetch("/api/admin/pricing/" + encodeURIComponent(id) + "/enable", { method: "POST", token })
    setRefreshKey((v) => v + 1)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold text-zinc-50">报价规则</div>
        <div className="mt-2 text-sm text-zinc-400">当前仅实现演示版规则切换与启用。</div>
      </div>

      {list.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30" />
          ))}
        </div>
      ) : list.error ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-rose-300">
          {list.error}
        </div>
      ) : (
        <div className="space-y-2">
          {(list.data || []).map((r) => (
            <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-zinc-50">{r.name}</div>
                    <span className="rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-0.5 text-[11px] text-zinc-300">
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
                <button
                  type="button"
                  disabled={r.enabled}
                  onClick={() => enable(r.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50 disabled:opacity-50"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  设为启用
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

