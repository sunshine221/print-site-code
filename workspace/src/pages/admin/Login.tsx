import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, ShieldCheck } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"

export default function AdminLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [account, setAccount] = useState("admin@example.com")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit() {
    setBusy(true)
    setError(null)
    try {
      const data = await apiFetch<{ token: string; user: { id: string; email: string; name: string } }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ account, password }),
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40">
              <ShieldCheck className="h-5 w-5 text-zinc-50" />
            </div>
            <div>
              <div className="text-lg font-semibold text-zinc-50">管理员登录</div>
              <div className="text-xs text-zinc-400">用于维护产品与跟进询价</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-zinc-400">邮箱或账号</label>
              <input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-rose-300">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              disabled={busy}
              onClick={onSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-70"
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
