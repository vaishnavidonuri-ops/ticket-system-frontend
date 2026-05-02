import { cn, STATUS_COLORS, STATUS_DOT, PRIORITY_COLORS, PRIORITY_DOT } from "@/lib/utils"

export const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border", STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600 border-slate-200")}>
    <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[status] ?? "bg-slate-400")} />
    {status}
  </span>
)

export const PriorityBadge = ({ priority }: { priority: string }) => (
  <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border", PRIORITY_COLORS[priority] ?? "bg-blue-100 text-blue-700 border-blue-200")}>
    <span className={cn("w-1.5 h-1.5 rounded-full", PRIORITY_DOT[priority] ?? "bg-blue-500")} />
    {priority}
  </span>
)

export const Badge = ({ children, variant = "default", className }: { children: React.ReactNode; variant?: "default"|"success"|"warning"|"danger"|"info"; className?: string }) => {
  const variantCls = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    danger:  "bg-red-100 text-red-700 border-red-200",
    info:    "bg-blue-100 text-blue-700 border-blue-200",
  }
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border", variantCls[variant], className)}>
      {children}
    </span>
  )
}
