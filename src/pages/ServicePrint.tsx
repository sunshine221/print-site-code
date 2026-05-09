import { Link } from "react-router-dom"
import { ArrowUpRight, BadgeCheck, FileUp, Layers3, Ruler } from "lucide-react"
import SiteShell from "@/components/SiteShell"
import { usePageTitle } from "@/hooks/usePageTitle"

const bullets = [
  { icon: Layers3, title: "工艺覆盖", desc: "FDM / SLA / SLS 等，按场景选择最优工艺。" },
  { icon: Ruler, title: "精度与公差", desc: "按功能件/外观件分级建议，必要时提供后处理方案。" },
  { icon: FileUp, title: "文件直传", desc: "上传 STL/STEP 等文件，快速给出预估报价区间。" },
  { icon: BadgeCheck, title: "交付保障", desc: "明确交付周期与质量检查点，便于项目管理与采购流程。" },
]

export default function ServicePrint() {
  usePageTitle("代打服务")

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">代打服务</div>
            <div className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              代打服务：需要上传模型文件。适合研发打样、功能验证、小批量试产。
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {bullets.map((b) => {
                const Icon = b.icon
                return (
                  <div
                    key={b.title}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      <Icon className="h-4 w-4 text-cyan-300" />
                      {b.title}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{b.desc}</div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">报价影响因素</div>
              <div className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <div>材料与工艺：不同材料成本、设备占用与后处理差异明显。</div>
                <div>精度与表面：高精度/更细层高会提高时间成本。</div>
                <div>体积/尺寸：体积越大、支撑越复杂，成本越高。</div>
                <div>数量与交期：数量阶梯与加急会影响区间倍率。</div>
              </div>
              <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
                提示：预估报价用于快速决策，最终价格以工程评估为准。
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">开始询价</div>
              <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                上传文件并填写需求，系统将按规则给出预估报价区间。
              </div>
              <div className="mt-6">
                <Link
                  to="/quote?type=service"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
                >
                  上传文件获取报价
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3">
                <Link
                  to="/work"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  我想选平台产品
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  )
}
