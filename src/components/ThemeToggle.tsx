import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export default function ThemeToggle({ className }: Props) {
  const { mode, cycleMode } = useTheme()

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor
  const label = mode === "light" ? "白天" : mode === "dark" ? "黑夜" : "跟随系统"

  return (
    <button
      type="button"
      onClick={cycleMode}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
        className,
      )}
      aria-label={`页面模式：${label}`}
      title={`页面模式：${label}`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

