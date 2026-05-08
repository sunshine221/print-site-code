import { Link, NavLink } from "react-router-dom"
import { ArrowUpRight, Layers3, PackageSearch, Printer, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
}

const navItems = [
  { to: "/work", label: "产品", icon: PackageSearch },
  { to: "/service/print", label: "代打服务", icon: Printer },
]

export default function SiteShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
              <Layers3 className="h-5 w-5 text-zinc-100" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">3D 打印工作室</div>
              <div className="text-[11px] text-zinc-400">产品展示 · SKU管理 · 询价报价</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50",
                      isActive && "bg-zinc-900 text-zinc-50",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/quote?type=service"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white"
            >
              获取报价
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/login"
              className="hidden items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50 md:inline-flex"
            >
              <Shield className="h-4 w-4" />
              后台
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} 3D 打印工作室</div>
          <div className="flex items-center gap-4">
            <Link to="/quote?type=service" className="hover:text-zinc-200">
              代打询价
            </Link>
            <Link to="/quote?type=product" className="hover:text-zinc-200">
              产品询价
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

