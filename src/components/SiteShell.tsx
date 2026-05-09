import { Link, NavLink } from "react-router-dom"
import { ArrowUpRight, Layers3, PackageSearch, Printer, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import ThemeToggle from "@/components/ThemeToggle"

type Props = {
  children: React.ReactNode
}

const navItems = [
  { to: "/work", label: "产品", icon: PackageSearch },
  { to: "/service/print", label: "代打服务", icon: Printer },
]

export default function SiteShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
              <Layers3 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">3D 打印工作室</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">产品展示 · SKU管理 · 询价报价</div>
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
                      "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
                      isActive && "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",
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
            <ThemeToggle className="hidden md:inline-flex" />
            <Link
              to="/work"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              浏览产品
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/quote?type=service"
              className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 md:inline-flex"
            >
              代打询价
            </Link>
            <Link
              to="/admin"
              className="hidden items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 md:inline-flex"
            >
              <Shield className="h-4 w-4" />
              后台
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-zinc-500 dark:text-zinc-400 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} 3D 打印工作室</div>
          <div className="flex items-center gap-4">
            <Link to="/quote?type=service" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              代打询价
            </Link>
            <Link to="/quote?type=product" className="hover:text-zinc-900 dark:hover:text-zinc-200">
              产品询价
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
