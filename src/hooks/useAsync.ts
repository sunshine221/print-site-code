import { useEffect, useState } from "react"

export function useAsync<T>(fn: () => Promise<T>, deps: any[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    fn()
      .then((v) => {
        if (!alive) return
        setData(v)
      })
      .catch((e) => {
        if (!alive) return
        setError(String(e?.message || e))
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, deps)

  return { data, error, loading }
}

