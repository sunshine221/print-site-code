import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Tag = { group: string; name: string }

export type ProductCardData = {
  id: string
  title: string
  summary: string
  process?: string | null
  material?: string | null
  leadTimeDays?: number | null
  priceHint?: string | null
  featured?: boolean
  tags?: Tag[]
  cover?: { url: string } | null
}

export default function ProductCard({
  data,
  className,
}: {
  data: ProductCardData
  className?: string
}) {
  return (
    <Link
      to={`/work/${data.id}`}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-950",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -top-24 left-10 h-48 w-48 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="absolute -bottom-24 right-10 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl" />
      </div>

      <div className="relative flex gap-4">
        <div className="h-20 w-28 flex-none overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          {data.cover?.url ? (
            <img
              src={data.cover.url}
              alt={data.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-200 to-zinc-50 dark:from-zinc-800 dark:to-zinc-950" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{data.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{data.summary}</div>
            </div>
            <ArrowUpRight className="mt-0.5 h-4 w-4 flex-none text-zinc-400 transition group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-200" />
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {data.process ? (
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                工艺 {data.process}
              </span>
            ) : null}
            {data.leadTimeDays ? (
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                交期 {data.leadTimeDays} 天
              </span>
            ) : null}
            {data.priceHint ? (
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                {data.priceHint}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
