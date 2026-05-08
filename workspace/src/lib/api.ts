export type ApiOk<T> = { success: true; data: T }
export type ApiErr = { success: false; error: string }

export function getApiBaseUrl() {
  return (import.meta as any).env?.VITE_API_BASE_URL || ""
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  input: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const token = init?.token
  const headers = new Headers(init?.headers || {})
  if (!headers.has("Content-Type") && init?.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json")
  }
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(`${getApiBaseUrl()}${input}`, { ...init, headers })
  const json = (await res.json().catch(() => null)) as ApiOk<T> | ApiErr | null

  if (!res.ok || !json || (json as any).success !== true) {
    const msg =
      (json as any)?.error ||
      (typeof (json as any)?.message === "string" ? (json as any).message : "") ||
      `请求失败 (${res.status})`
    throw new ApiError(msg, res.status)
  }

  return (json as ApiOk<T>).data
}
