import { Link } from "react-router-dom"
import { ArrowUpRight, CheckCircle2, Cpu, Gauge, Sparkles } from "lucide-react"
import SiteShell from "@/components/SiteShell"
import ProductCard from "@/components/ProductCard"
import { apiFetch } from "@/lib/api"
import { useAsync } from "@/hooks/useAsync"

type ProductListItem = Parameters<typeof ProductCard>[0]["data"]

export default function Home() {
  const featured = useAsync(
    () => apiFetch<ProductListItem[]>("/api/products?featured=true"),
    [],
  )

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-52 right-1/4 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[length:18px_18px] opacity-60" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 md:py-20">
          <div className="grid items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-xs text-zinc-300">
                <Sparkles className="h-3.5 w-3.5" />
                快速打样 · 小批量 · SKU产品
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                把“可制造性”变成可展示、可询价、可成交
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
                面向代打服务与平台产品两条路径：代打直接上传文件获取报价；平台产品选择SKU提交询价，无需上传文件。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/quote?type=service"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
                >
                  代打上传报价
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/work"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900"
                >
                  浏览平台产品
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
                    <Gauge className="h-4 w-4 text-cyan-300" />
                    交期可控
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">按工艺与排产策略给出更稳定的交付预期。</div>
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
                    <Cpu className="h-4 w-4 text-amber-300" />
                    报价可解释
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">基于材料/工艺/精度/交期等规则输出区间。</div>
                </div>
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    线索可跟进
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">后台支持状态流转、备注、导出。</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-sm font-semibold text-zinc-50">精选产品</div>
                <div className="mt-3 space-y-3">
                  {featured.loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-[92px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30"
                        />
                      ))}
                    </div>
                  ) : featured.error ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-rose-300">
                      {featured.error}
                    </div>
                  ) : (
                    (featured.data || []).slice(0, 3).map((p) => (
                      <ProductCard key={p.id} data={p} />
                    ))
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    to="/work"
                    className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-zinc-50"
                  >
                    查看全部产品
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
