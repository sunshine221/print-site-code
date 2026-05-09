import { create } from "zustand"

type AdminUser = {
  id: string
  email: string
  name: string
}

type AuthState = {
  token: string | null
  user: AdminUser | null
  setAuth: (token: string, user: AdminUser) => void
  clear: () => void
}

const storageKey = "print_site_admin_auth"

function loadInitial(): Pick<AuthState, "token" | "user"> {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { token: null, user: null }
    const parsed = JSON.parse(raw) as any
    return {
      token: typeof parsed.token === "string" ? parsed.token : null,
      user: parsed.user || null,
    }
  } catch {
    return { token: null, user: null }
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const init = typeof window !== "undefined" ? loadInitial() : { token: null, user: null }
  return {
    token: init.token,
    user: init.user,
    setAuth: (token, user) => {
      localStorage.setItem(storageKey, JSON.stringify({ token, user }))
      set({ token, user })
    },
    clear: () => {
      localStorage.removeItem(storageKey)
      set({ token: null, user: null })
    },
  }
})

