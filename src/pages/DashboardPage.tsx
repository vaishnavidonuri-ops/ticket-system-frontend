import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Ticket, Clock, CheckCircle, AlertTriangle, TrendingUp, ArrowRight, RefreshCw, Plus } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card"
import { StatusBadge, PriorityBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API, formatDateTime } from "@/lib/utils"

interface Stats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  byPriority?: Record<string, number>
}

interface TicketRow {
  id: string
  ticketNumber?: string
  title: string
  status: string
  priority: string
  department: string
  createdAt: string
  assignedToName?: string
  issueType?: string
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, tRes] = await Promise.all([
        fetch(`${API}/tickets/stats`),
        fetch(`${API}/tickets/all?limit=8&page=1`),
      ])
      if (sRes.ok) {
        const d = await sRes.json()
        const s = d.data ?? d
        const byStatus: Array<{ status: string; count: string }> = s.byStatus ?? []
        const get = (st: string) => {
          const found = byStatus.find(x => x.status === st)
          return found ? Number(found.count) : 0
        }
        setStats({
          total:      Number(s.total ?? 0),
          open:       get("New"),
          inProgress: get("In Progress"),
          resolved:   get("Resolved"),
          closed:     get("Closed"),
          byPriority: s.byPriority,
        })
      }
      if (tRes.ok) {
        const d = await tRes.json()
        setRecent(d.data?.rows ?? d.data ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const statCards = [
    { label: "Total",       value: stats?.total ?? 0,      icon: Ticket,        color: "text-blue-600",   bg: "bg-blue-50",   ring: "ring-blue-100",   filter: "" },
    { label: "Open",        value: stats?.open ?? 0,       icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-100", filter: "New" },
    { label: "In Progress", value: stats?.inProgress ?? 0, icon: Clock,         color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-100", filter: "In Progress" },
    { label: "Resolved",    value: stats?.resolved ?? 0,   icon: CheckCircle,   color: "text-green-600",  bg: "bg-green-50",  ring: "ring-green-100",  filter: "Resolved" },
  ]

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">IT Helpdesk Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Welcome back, Alice Johnson</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/create-ticket")}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Request
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, ring, filter }) => (
            <button
              key={label}
              onClick={() => navigate(filter ? `/tickets?status=${encodeURIComponent(filter)}` : "/tickets")}
              className={`bg-white rounded-xl border border-slate-200 ring-1 ${ring} p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow text-left`}
            >
              <div className={`${bg} ${color} p-3 rounded-lg shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{loading ? "—" : value}</div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Priority breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" /> By Priority
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { label: "Critical", bar: "bg-red-500",    key: "Critical" },
                { label: "High",     bar: "bg-orange-500", key: "High" },
                { label: "Medium",   bar: "bg-yellow-500", key: "Medium" },
                { label: "Low",      bar: "bg-green-500",  key: "Low" },
              ].map(({ label, bar, key }) => {
                const val = stats?.byPriority?.[key] ?? 0
                const pct = stats?.total ? Math.round((val / stats.total) * 100) : 0
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium">{label}</span>
                      <span>{val}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </CardBody>
          </Card>

          {/* Recent tickets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <button onClick={() => navigate("/tickets")} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </CardHeader>
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
                ) : recent.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm">No tickets yet</div>
                ) : recent.map(t => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-slate-400">#{String(t.id).padStart(6, "0")}</div>
                      <div className="text-sm font-medium text-slate-800 truncate">{t.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {t.department} {t.issueType ? `• ${t.issueType}` : ""} • {formatDateTime(t.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
