import { useEffect, useMemo, useState } from "react"

export type ThemeMode = "system" | "light" | "dark"

const storageKey = "print_site_theme_mode"

function getSystemIsDark() {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
}

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "system"
  const saved = String(localStorage.getItem(storageKey) || "") as ThemeMode
  if (saved === "light" || saved === "dark" || saved === "system") return saved
  return "system"
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialMode())
  const isDark = useMemo(() => (mode === "system" ? getSystemIsDark() : mode === "dark"), [mode])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(storageKey, mode)
  }, [mode])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (mode !== "system") return

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)")
    if (!mq) return

    const onChange = () => {
      document.documentElement.classList.toggle("dark", mq.matches)
    }

    if ("addEventListener" in mq) mq.addEventListener("change", onChange)
    else (mq as any).addListener(onChange)

    return () => {
      if ("removeEventListener" in mq) mq.removeEventListener("change", onChange)
      else (mq as any).removeListener(onChange)
    }
  }, [mode])

  const cycleMode = () => {
    setMode((prev) => (prev === "system" ? "light" : prev === "light" ? "dark" : "system"))
  }

  return { mode, setMode, cycleMode, isDark }
}
