import { useMemo, useState } from "react"
import { UploadCloud, X } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { cn } from "@/lib/utils"

type UploadedAsset = {
  url: string
  name: string
  size: number
  mimeType?: string
}

type PresignResult = {
  method: "PUT"
  url: string
  key: string
  bucket: string
  region: string
  headers: Record<string, string>
  expiresIn: number
}

function buildCosObjectUrl(bucket: string, region: string, key: string) {
  return `https://${bucket}.cos.${region}.myqcloud.com/${key}`
}

export default function FileUpload({
  value,
  onChange,
  maxFiles = 3,
}: {
  value: UploadedAsset[]
  onChange: (next: UploadedAsset[]) => void
  maxFiles?: number
}) {
  const [busy, setBusy] = useState(false)
  const canAdd = value.length < maxFiles

  const accept = useMemo(
    () => ".stl,.step,.stp,.obj,.glb,.zip,.pdf,.png,.jpg,.jpeg",
    [],
  )

  async function uploadOne(file: File) {
    const presign = await apiFetch<PresignResult>("/api/uploads/presign", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      }),
    })

    const putRes = await fetch(presign.url, {
      method: "PUT",
      headers: presign.headers,
      body: file,
    })
    if (!putRes.ok) {
      throw new Error(`上传失败 (${putRes.status})`)
    }

    return {
      url: buildCosObjectUrl(presign.bucket, presign.region, presign.key),
      name: file.name,
      size: file.size,
      mimeType: file.type || undefined,
    } satisfies UploadedAsset
  }

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return
    const next = [...value]
    setBusy(true)
    try {
      for (const f of Array.from(files)) {
        if (next.length >= maxFiles) break
        const asset = await uploadOne(f)
        next.push(asset)
        onChange([...next])
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950",
          busy && "opacity-70",
        )}
      >
        <input
          type="file"
          multiple
          accept={accept}
          disabled={!canAdd || busy}
          onChange={(e) => onPick(e.target.files)}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
            <UploadCloud className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {busy ? "正在上传…" : "上传文件（可选）"}
            </div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              支持 STL/STEP/OBJ/GLB/ZIP/PDF/图片；单文件大小受服务端限制
            </div>
          </div>
        </div>
      </div>

      {value.length ? (
        <div className="space-y-2">
          {value.map((a, idx) => (
            <div
              key={`${a.url}_${idx}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="min-w-0">
                <div className="truncate text-sm text-zinc-900 dark:text-zinc-100">{a.name}</div>
                <div className="text-xs text-zinc-500">{Math.round(a.size / 1024)} KB</div>
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export type { UploadedAsset }
