import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"
import { usePageTitle } from "@/hooks/usePageTitle"

type PricingRule = {
  id: string
  name: string
  version: string
  enabled: boolean
  rule: any
  createdAt: string
}

export default function AdminPricingEdit() {
  const token = useAuthStore((s) => s.token) || ""
  const params = useParams()
  const ruleId = params.id ? String(params.id) : ""
  const isNew = !ruleId
  const navigate = useNavigate()

  usePageTitle(isNew ? "后台 · 新增报价规则" : "后台 · 编辑报价规则")

  const detail = useAsync(
    () => (ruleId ? apiFetch<PricingRule>(`/api/admin/pricing/${encodeURIComponent(ruleId)}`, { token }) : null),
    [ruleId, token],
  )

  const [name, setName] = useState("")
  const [version, setVersion] = useState("")
  const [enabled, setEnabled] = useState(false)
  const [ruleText, setRuleText] = useState("{}")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const d = detail.data
    if (!d) return
    setName(d.name || "")
    setVersion(d.version || "")
    setEnabled(Boolean(d.enabled))
    setRuleText(JSON.stringify(d.rule || {}, null, 2))
  }, [detail.data])

  const canSave = useMemo(() => Boolean(version.trim()), [version])

  async function save() {
    if (!canSave) return
    setBusy(true)
    setError(null)
    let rule: any = {}
    try {
      rule = ruleText.trim() ? JSON.parse(ruleText) : {}
    } catch {
      setBusy(false)
      setError("规则内容必须为合法 JSON")
      return
    }

    try {
      if (isNew) {
        const created = await apiFetch<{ id: string }>("/api/admin/pricing", {
          method: "POST",
          token,
          body: JSON.stringify({
            name: name.trim() || "报价规则",
            version: version.trim(),
            enabled,
            rule,
          }),
        })
        navigate(`/admin/pricing/${encodeURIComponent(created.id)}/edit`, { replace: true })
        return
      }

      await apiFetch(`/api/admin/pricing/${encodeURIComponent(ruleId)}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name: name.trim() || "报价规则",
          version: version.trim(),
          enabled,
          rule,
        }),
      })
      navigate("/admin/pricing", { replace: true })
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (isNew) return
    const ok = window.confirm("确认删除该规则？")
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await apiFetch(`/api/admin/pricing/${encodeURIComponent(ruleId)}`, { method: "DELETE", token })
      navigate("/admin/pricing", { replace: true })
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/pricing"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          返回报价规则
        </Link>
        <div className="flex items-center gap-2">
          {!isNew ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300 dark:hover:bg-zinc-900"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          ) : null}
          <button
            type="button"
            onClick={save}
            disabled={!canSave || busy}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-50 transition hover:bg-zinc-900 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
          >
            <Save className="h-4 w-4" />
            保存
          </button>
        </div>
      </div>

      {detail.loading ? (
        <div className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30" />
      ) : detail.error ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300">
          {detail.error}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">规则名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">版本（必填）</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-4 w-4" />
              规则启用
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">规则内容（JSON）</label>
            <textarea
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              rows={14}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 font-mono text-xs text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
