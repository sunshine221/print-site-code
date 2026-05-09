import { Link } from "react-router-dom"
import { ArrowLeft, CheckCircle2, Info } from "lucide-react"
import FileUpload, { type UploadedAsset } from "@/components/FileUpload"

type Props = {
  type: "service" | "product"
  backTo: string
  title: string
  subtitle: string
  productTitle?: string
  skuCode?: string
  skuAttrsText?: string
  name: string
  setName: (v: string) => void
  email: string
  setEmail: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  company: string
  setCompany: (v: string) => void
  quantity: number
  setQuantity: (v: number) => void
  processPreference: string
  setProcessPreference: (v: string) => void
  materialPreference: string
  setMaterialPreference: (v: string) => void
  precisionPreference: string
  setPrecisionPreference: (v: string) => void
  leadTimePreference: string
  setLeadTimePreference: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  attachments: UploadedAsset[]
  setAttachments: (v: UploadedAsset[]) => void
  error: string | null
  okId: string | null
}

export default function QuoteMainCard(props: Props) {
  const isService = props.type === "service"
  const isProduct = props.type === "product"

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          to={props.backTo}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{props.title}</div>
            <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{props.subtitle}</div>
          </div>
          <div className="hidden rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 md:block">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-zinc-500" />
              预估区间仅供参考
            </div>
          </div>
        </div>

        {isProduct ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">当前选择</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {props.productTitle || "产品"} · {props.skuCode || "SKU"}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{props.skuAttrsText || ""}</div>
          </div>
        ) : null}

        {isService ? (
          <div className="mt-6">
            <FileUpload value={props.attachments} onChange={props.setAttachments} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">姓名 *</label>
            <input
              value={props.name}
              onChange={(e) => props.setName(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="你的称呼"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">邮箱（邮箱或电话至少填一项）</label>
            <input
              value={props.email}
              onChange={(e) => props.setEmail(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="用于接收回执与沟通"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">电话（邮箱或电话至少填一项）</label>
            <input
              value={props.phone}
              onChange={(e) => props.setPhone(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="可选"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">公司</label>
            <input
              value={props.company}
              onChange={(e) => props.setCompany(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="可选"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">数量</label>
            <input
              type="number"
              min={1}
              value={props.quantity}
              onChange={(e) => props.setQuantity(Math.max(1, Number(e.target.value || 1)))}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">交期偏好</label>
            <input
              value={props.leadTimePreference}
              onChange={(e) => props.setLeadTimePreference(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="例如：3天内 / 可加急"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">工艺偏好</label>
            <input
              value={props.processPreference}
              onChange={(e) => props.setProcessPreference(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="例如：FDM / SLA / SLS"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400">材料偏好</label>
            <input
              value={props.materialPreference}
              onChange={(e) => props.setMaterialPreference(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="例如：PLA / ABS / PA12"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">精度偏好</label>
            <input
              value={props.precisionPreference}
              onChange={(e) => props.setPrecisionPreference(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="例如：高精度 / ±0.1mm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">备注</label>
            <textarea
              value={props.notes}
              onChange={(e) => props.setNotes(e.target.value)}
              className="mt-2 min-h-24 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-700"
              placeholder="用途、装配要求、表面处理等"
            />
          </div>
        </div>

        {props.error ? (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-rose-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-300">
            {props.error}
          </div>
        ) : null}

        {props.okId ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              已提交成功
            </div>
            <div className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-200/80">订单编号：{props.okId}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
