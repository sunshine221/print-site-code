import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { ApiError, apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clear = useAuthStore((s) => s.clear)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }
    apiFetch<{ id: string; email: string; name: string }>("/api/auth/me", { token })
      .then((u) => setAuth(token, u))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) clear()
      })
      .finally(() => setChecking(false))
  }, [clear, setAuth, token])

  if (!token) return <Navigate to="/admin/login" replace />
  if (checking && !user)
    return <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100" />
  return <>{children}</>
}
