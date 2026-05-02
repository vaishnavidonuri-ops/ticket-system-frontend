import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { Card } from "@/components/ui/card"
import { StatusBadge, PriorityBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API, CURRENT_USER, formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"

export default function MyTicketsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<"created" | "assigned">("created")
  const [created,  setCreated]  = useState<any[]>([])
  const [assigned, setAssigned] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API}/tickets/all?created_by=${CURRENT_USER.id}&limit=50`).then(r => r.json()),
      fetch(`${API}/tickets/all?assigned_to=${CURRENT_USER.id}&limit=50`).then(r => r.json()),
    ]).then(([c, a]) => {
      setCreated(c?.data?.rows ?? c?.data ?? [])
      setAssigned(a?.data?.rows ?? a?.data ?? [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const tickets = tab === "created" ? created : assigned

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "My Tickets" }]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">My Tickets</h1>
            <p className="text-xs text-slate-500 mt-0.5">Tickets created or assigned to you</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate("/create-ticket")}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Incident
          </Button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(["created", "assigned"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "created" ? `Created by me (${created.length})` : `Assigned to me (${assigned.length})`}
            </button>
          ))}
        </div>

        <Card>
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-sm font-medium text-slate-600">No tickets found</div>
              <div className="text-xs text-slate-400 mt-1">
                {tab === "created" ? "You haven't created any tickets yet." : "No tickets assigned to you."}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map(t => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-blue-600 font-semibold">
                        #{String(t.id).padStart(6, "0")}
                      </span>
                      <span className="text-xs text-slate-400">{t.department}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-800 truncate">{t.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{formatDate(t.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={t.priority ?? "Medium"} />
                    <StatusBadge status={t.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}
