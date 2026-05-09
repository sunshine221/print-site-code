import { usePageTitle } from "@/hooks/usePageTitle"

export default function AdminSettings() {
  usePageTitle("后台 · 设置")

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">站点设置</div>
      <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">演示版：后续可接入导航配置、联系信息、首页区块开关等。</div>
    </div>
  )
}
