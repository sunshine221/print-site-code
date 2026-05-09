import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { ClipboardList, LayoutDashboard, LogOut, Package, Settings, SlidersHorizontal } from "lucide-react"
import { useState } from "react"
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
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  function onLogout() {
    navigate("/", { replace: true })
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
              onClick={() => setLogoutOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
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

      {logoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="close"
            onClick={() => setLogoutOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">确认退出</div>
            <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">确认退出登录？</div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutOpen(false)
                  onLogout()
                }}
                className="inline-flex items-center justify-center rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
