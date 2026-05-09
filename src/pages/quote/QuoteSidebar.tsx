import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuoteEstimate } from "./types"
import { formatRange } from "./types"

type Props = {
  estimate: QuoteEstimate | null
  onEstimate: () => void
  onSubmit: () => void
  canSubmit: boolean
  submitting: boolean
  productReady: boolean
}

export default function QuoteSidebar({
  estimate,
  onEstimate,
  onSubmit,
  canSubmit,
  submitting,
  productReady,
}: Props) {
  return (
    <div className="sticky top-24 space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">预估报价</div>
        <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {estimate ? formatRange(estimate) : "点击计算预估区间"}
        </div>
        {estimate?.disclaimer ? <div className="mt-3 text-xs text-zinc-500">{estimate.disclaimer}</div> : null}
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={onEstimate}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            计算预估区间
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canSubmit || submitting || !productReady}
            onClick={onSubmit}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition",
              canSubmit && !submitting && productReady
                ? "bg-zinc-950 text-zinc-50 hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
                : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            提交询价
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">两条路径</div>
        <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">平台产品</span>：选择现有产品，不需要上传文件。
          </div>
          <div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">代打服务</span>：需要上传模型文件。
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Link
            to="/work"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            去选产品
          </Link>
          <Link
            to="/quote?type=service"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            代打询价
          </Link>
        </div>
      </div>
    </div>
  )
}
