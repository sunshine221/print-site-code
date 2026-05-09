import { NavLink, Outlet } from "react-router-dom"
import { ClipboardList, LayoutDashboard, LogOut, Package, Settings, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth"

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-12">
        <aside className="md:col-span-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="text-sm font-semibold text-zinc-50">后台管理</div>
            <div className="mt-1 text-xs text-zinc-400">{user?.email || ""}</div>
            <div className="mt-4 space-y-1">
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50",
                        isActive && "bg-zinc-900 text-zinc-50",
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
              onClick={onLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
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
