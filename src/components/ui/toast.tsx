import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info"

interface ToastItem { id: number; type: ToastType; message: string }

let addToastFn: ((type: ToastType, msg: string) => void) | null = null

export const toast = {
  success: (msg: string) => addToastFn?.("success", msg),
  error:   (msg: string) => addToastFn?.("error", msg),
  info:    (msg: string) => addToastFn?.("info", msg),
}

const icons = {
  success: <CheckCircle className="h-4 w-4 text-green-600" />,
  error:   <XCircle className="h-4 w-4 text-red-600" />,
  info:    <Info className="h-4 w-4 text-blue-600" />,
}

const styles = {
  success: "border-green-200 bg-green-50 text-green-800",
  error:   "border-red-200 bg-red-50 text-red-800",
  info:    "border-blue-200 bg-blue-50 text-blue-800",
}

export const ToastProvider = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    addToastFn = (type, message) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, type, message }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }
    return () => { addToastFn = null }
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 min-w-[300px]">
      {toasts.map(t => (
        <div key={t.id} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium animate-in slide-in-from-right-full", styles[t.type])}>
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
