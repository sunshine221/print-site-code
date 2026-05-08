import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import SiteShell from "@/components/SiteShell"
import ProductCard from "@/components/ProductCard"
import { apiFetch } from "@/lib/api"
import { useAsync } from "@/hooks/useAsync"

type ProductListItem = Parameters<typeof ProductCard>[0]["data"]

export default function WorkList() {
  const [q, setQ] = useState("")
  const query = useMemo(() => q.trim(), [q])

  const list = useAsync(
    () => apiFetch<ProductListItem[]>(`/api/products?search=${encodeURIComponent(query)}`),
    [query],
  )

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-2xl font-semibold text-zinc-50">平台产品</div>
            <div className="mt-2 text-sm text-zinc-400">
              选择 SKU 后可直接询价（无需上传文件）。
            </div>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索名称 / SKU / 关键词"
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none transition focus:border-zinc-700"
            />
          </div>
        </div>

        <div className="mt-8">
          {list.loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[110px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30"
                />
              ))}
            </div>
          ) : list.error ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-rose-300">
              {list.error}
            </div>
          ) : (list.data || []).length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
              暂无匹配结果
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(list.data || []).map((p) => (
                <ProductCard key={p.id} data={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  )
}

