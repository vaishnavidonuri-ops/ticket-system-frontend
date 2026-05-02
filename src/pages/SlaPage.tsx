import { useEffect, useState } from "react"
import { Plus, Clock } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { PriorityBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { API } from "@/lib/utils"
import departments from "@/data/departments.json"

const ISSUE_TYPES = ["Hardware", "Software", "Network", "HR", "Facilities", "Finance", "General", "Security", "Account/Access", "Maintenance", "Invoice", "HR Request", "Network Issue", "Hardware Issue", "Software Issue"]
const PRIORITIES  = ["Low", "Medium", "High", "Critical"]

const DEFAULT_SLA = [
  { id: -1, department: "IT Support",           issueType: "Hardware Issue", priority: "Critical", responseTimeHours: 1,  resolutionTimeHours: 4  },
  { id: -2, department: "IT Support",           issueType: "Software Issue", priority: "High",     responseTimeHours: 2,  resolutionTimeHours: 8  },
  { id: -3, department: "IT Support",           issueType: "Network Issue",  priority: "High",     responseTimeHours: 2,  resolutionTimeHours: 8  },
  { id: -4, department: "Facilities Management",issueType: "Maintenance",    priority: "Medium",   responseTimeHours: 4,  resolutionTimeHours: 24 },
  { id: -5, department: "Human Resources",      issueType: "HR Request",     priority: "Low",      responseTimeHours: 8,  resolutionTimeHours: 48 },
  { id: -6, department: "Finance",              issueType: "Invoice",        priority: "Medium",   responseTimeHours: 4,  resolutionTimeHours: 24 },
]

const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"

export default function SlaPage() {
  const [rules,     setRules]    = useState<any[]>([])
  const [loading,   setLoading]  = useState(true)
  const [showForm,  setShowForm] = useState(false)
  const [submitting,setSubmitting] = useState(false)

  const [form, setForm] = useState({
    department: "", issueType: "", priority: "Medium",
    responseTimeHours: 4, resolutionTimeHours: 24,
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }))

  const loadRules = () => {
    setLoading(true)
    fetch(`${API}/sla`)
      .then(r => r.json())
      .then(d => setRules(d?.data?.length ? d.data : DEFAULT_SLA))
      .catch(() => setRules(DEFAULT_SLA))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadRules() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.department || !form.issueType) { toast.error("Department and Issue Type are required"); return }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/sla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: form.department,
          issueType: form.issueType,
          priority: form.priority,
          responseTimeHours: form.responseTimeHours,
          resolutionTimeHours: form.resolutionTimeHours,
        }),
      })
      if (res.ok) {
        toast.success("SLA rule created!")
        setShowForm(false)
        setForm({ department: "", issueType: "", priority: "Medium", responseTimeHours: 4, resolutionTimeHours: 24 })
        loadRules()
      } else toast.error("Failed to create rule")
    } catch { toast.error("Network error") }
    finally { setSubmitting(false) }
  }

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "SLA Rules" }]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">SLA Rules</h1>
            <p className="text-xs text-slate-500 mt-0.5">Service level agreement configuration</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Rule
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" /> SLA Configuration
            </CardTitle>
            <span className="text-xs text-slate-400">{rules.length} rules</span>
          </CardHeader>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["Department", "Issue Type", "Priority", "Response Time", "Resolution Time", "Status"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map((r, i) => (
                    <tr key={r.id ?? i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-800 font-medium">{r.department}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{r.issueType ?? r.issue_type}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700 font-medium">{r.responseTimeHours ?? r.response_time_hours}h</span>
                        <span className="text-xs text-slate-400 ml-1">response</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700 font-medium">{r.resolutionTimeHours ?? r.resolution_time_hours}h</span>
                        <span className="text-xs text-slate-400 ml-1">resolution</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                          r.isActive !== false ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.isActive !== false ? "bg-green-500" : "bg-slate-400"}`} />
                          {r.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Add Rule dialog */}
      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add SLA Rule"
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Creating…" : "Create Rule"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Department *</label>
              <select className={inputCls} value={form.department} onChange={set("department")} required>
                <option value="">— Select —</option>
                {(departments as string[]).map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Issue Type *</label>
              <select className={inputCls} value={form.issueType} onChange={set("issueType")} required>
                <option value="">— Select —</option>
                {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Priority</label>
              <select className={inputCls} value={form.priority} onChange={set("priority")}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Response Time (hours)</label>
              <input type="number" min={1} className={inputCls} value={form.responseTimeHours} onChange={set("responseTimeHours")} />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Resolution Time (hours)</label>
              <input type="number" min={1} className={inputCls} value={form.resolutionTimeHours} onChange={set("resolutionTimeHours")} />
            </div>
          </div>
        </form>
      </Dialog>
    </AppShell>
  )
}
