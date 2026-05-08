import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth"
import { useAsync } from "@/hooks/useAsync"
import { usePageTitle } from "@/hooks/usePageTitle"

type InquiryDetail = {
  id: string
  status: string
  inquiryType: string
  productId?: string | null
  skuId?: string | null
  request: any
  quoteEstimate?: any | null
  pricingRuleVersion?: string | null
  internalNote?: string | null
  attachments: Array<{ id: string; url: string; name: string; size?: number | null; mimeType?: string | null }>
  createdAt: string
  updatedAt: string
}

const statuses = [
  { value: "new", label: "新建" },
  { value: "processing", label: "处理中" },
  { value: "quoted", label: "已报价" },
  { value: "closed", label: "已关闭" },
]

export default function AdminInquiryDetail() {
  const token = useAuthStore((s) => s.token) || ""
  const params = useParams()
  const id = String(params.id || "")
  const navigate = useNavigate()

  usePageTitle("后台 · 询价详情")

  const detail = useAsync(() => apiFetch<InquiryDetail>(`/api/admin/inquiries/${encodeURIComponent(id)}`, { token }), [
    id,
    token,
  ])

  const [status, setStatus] = useState("new")
  const [internalNote, setInternalNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!detail.data) return
    setStatus(detail.data.status)
    setInternalNote(detail.data.internalNote || "")
  }, [detail.data])

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await apiFetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status, internalNote }),
      })
      navigate("/admin/inquiries", { replace: true })
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    const ok = window.confirm("确认删除该询价？")
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await apiFetch(`/api/admin/inquiries/${encodeURIComponent(id)}`, { method: "DELETE", token })
      navigate("/admin/inquiries", { replace: true })
    } catch (e: any) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  const d = detail.data

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/inquiries"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          返回询价列表
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300 dark:hover:bg-zinc-900"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy}
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

      {d ? (
        <div className="grid gap-4 md:grid-cols-12">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 md:col-span-7">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">订单编号</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{d.id}</div>
            <div className="mt-4 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <div>类型：{d.inquiryType === "service_print" ? "代打" : "产品"}</div>
              <div>状态：{statuses.find((s) => s.value === d.status)?.label || d.status}</div>
              <div>提交时间：{new Date(d.createdAt).toLocaleString()}</div>
            </div>

            <div className="mt-6 text-sm font-semibold text-zinc-900 dark:text-zinc-50">询价信息</div>
            <pre className="mt-2 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-100">
              {JSON.stringify(d.request || {}, null, 2)}
            </pre>

            {d.quoteEstimate ? (
              <>
                <div className="mt-6 text-sm font-semibold text-zinc-900 dark:text-zinc-50">预估报价</div>
                <pre className="mt-2 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-100">
                  {JSON.stringify(d.quoteEstimate || {}, null, 2)}
                </pre>
              </>
            ) : null}
          </div>

          <div className="space-y-4 md:col-span-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">处理</div>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 dark:text-zinc-400">状态</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 dark:text-zinc-400">备注</label>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    rows={6}
                    className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">附件</div>
              <div className="mt-3 space-y-2">
                {d.attachments?.length ? (
                  d.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      {a.name || a.url}
                    </a>
                  ))
                ) : (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">无附件</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
