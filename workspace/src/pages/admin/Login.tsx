import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, ShieldCheck } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import ThemeToggle from "@/components/ThemeToggle"
import { usePageTitle } from "@/hooks/usePageTitle"

export default function AdminLogin() {
  usePageTitle("后台登录")

  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const clear = useAuthStore((s) => s.clear)
  const setAuth = useAuthStore((s) => s.setAuth)
<<<<<<< HEAD
  const [account, setAccount] = useState("admin@example.com")
=======
  const [identifier, setIdentifier] = useState("")
>>>>>>> dd29c8ccdf4fd915287165702b3859a3555b2499
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    apiFetch<{ id: string; email: string; name: string }>("/api/auth/me", { token })
      .then(() => navigate("/admin/dashboard", { replace: true }))
      .catch(() => clear())
  }, [clear, navigate, token])

  async function onSubmit() {
    setBusy(true)
    setError(null)
    try {
      const data = await apiFetch<{ token: string; user: { id: string; email: string; name: string } }>(
        "/api/auth/login",
        {
          method: "POST",
<<<<<<< HEAD
          body: JSON.stringify({ account, password }),
=======
          body: JSON.stringify({ identifier, password }),
>>>>>>> dd29c8ccdf4fd915287165702b3859a3555b2499
        },
      )
      setAuth(data.token, data.user)
      navigate("/admin/dashboard", { replace: true })
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
              <ShieldCheck className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
            </div>
            <div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">管理员登录</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">用于维护产品与跟进询价</div>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-6 space-y-4">
            <div>
<<<<<<< HEAD
              <label className="text-xs text-zinc-400">邮箱或账号</label>
              <input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
=======
              <label className="text-xs text-zinc-500 dark:text-zinc-400">账号或邮箱</label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="请输入账号或邮箱"
                className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
>>>>>>> dd29c8ccdf4fd915287165702b3859a3555b2499
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-3 text-sm text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              disabled={busy}
              onClick={onSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              <Lock className="h-4 w-4" />
              登录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
