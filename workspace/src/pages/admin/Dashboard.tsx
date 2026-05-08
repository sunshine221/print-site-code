import { useMemo } from "react"
import { Activity, FileText, Package, Sparkles } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"

type InquiryItem = {
  id: string
  status: string
  inquiryType: string
  createdAt: string
}

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token) || ""
  const inquiries = useAsync(() => apiFetch<InquiryItem[]>("/api/admin/inquiries", { token }), [token])
  const products = useAsync(() => apiFetch<any[]>("/api/admin/products", { token }), [token])

  const stats = useMemo(() => {
    const list = inquiries.data || []
    const total = list.length
    const pending = list.filter((i) => i.status === "new" || i.status === "processing").length
    const service = list.filter((i) => i.inquiryType === "service_print").length
    return { total, pending, service }
  }, [inquiries.data])

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold text-zinc-50">仪表盘</div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
            <Activity className="h-4 w-4 text-cyan-300" />
            本次启动后的询价概览
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-xs text-zinc-400">总询价</div>
              <div className="mt-1 text-xl font-semibold text-zinc-50">{stats.total}</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-xs text-zinc-400">待处理</div>
              <div className="mt-1 text-xl font-semibold text-zinc-50">{stats.pending}</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-xs text-zinc-400">代打线索</div>
              <div className="mt-1 text-xl font-semibold text-zinc-50">{stats.service}</div>
            </div>
          </div>
          {inquiries.error ? <div className="mt-3 text-sm text-rose-300">{inquiries.error}</div> : null}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
            <Package className="h-4 w-4 text-amber-300" />
            产品与内容
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-400">产品数量</div>
                <Sparkles className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="mt-1 text-xl font-semibold text-zinc-50">
                {products.loading ? "…" : (products.data || []).length}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-400">提示</div>
                <FileText className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="mt-1 text-sm text-zinc-300">
                演示数据已自动初始化，可直接用于展示与询价流程验证。
              </div>
            </div>
          </div>
          {products.error ? <div className="mt-3 text-sm text-rose-300">{products.error}</div> : null}
        </div>
      </div>
    </div>
  )
}

