import { NavLink, Outlet } from "react-router-dom"
import { ClipboardList, LayoutDashboard, LogOut, Package, Settings, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth"
import ThemeToggle from "@/components/ThemeToggle"

const items = [
  { to: "/admin/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { to: "/admin/products", label: "产品", icon: Package },
  { to: "/admin/inquiries", label: "询价", icon: ClipboardList },
  { to: "/admin/pricing", label: "报价规则", icon: SlidersHorizontal },
  { to: "/admin/settings", label: "设置", icon: Settings },
]

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)

  function onLogout() {
    const ok = window.confirm("确认退出登录？")
    if (!ok) return
    clear()
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-12">
        <aside className="md:col-span-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">后台管理</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{user?.email || ""}</div>
            <ThemeToggle className="mt-4 w-full justify-center" />
            <div className="mt-4 space-y-1">
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
                        isActive && "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>

            <button
              type="button"
<<<<<<< HEAD
              onClick={onLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
=======
              onClick={clear}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
>>>>>>> dd29c8ccdf4fd915287165702b3859a3555b2499
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </div>
        </aside>

        <main className="md:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
