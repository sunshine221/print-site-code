import { useEffect } from "react"

export function usePageTitle(title: string) {
  useEffect(() => {
    if (typeof document === "undefined") return
    document.title = title
  }, [title])
}

