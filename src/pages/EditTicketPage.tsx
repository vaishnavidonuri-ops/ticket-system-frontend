import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardBody } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { API, CURRENT_USER } from "@/lib/utils"
import departments from "@/data/departments.json"
import users from "@/data/users.json"

const ISSUE_TYPES = ["Hardware", "Software", "Network", "HR", "Facilities", "Finance", "General", "Security", "Account/Access"]
const PRIORITIES  = ["Low", "Medium", "High", "Critical"]
const STATUSES    = ["New", "In Progress", "Resolved", "Closed"]
const LOCATIONS   = ["Base Site", "HO Secunderabad", "Garhmukeshwar Depot", "Vizag Plant", "Hyderabad Office"]

const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

export default function EditTicketPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: "", description: "", department: "", issueType: "",
    location: "", priority: "Medium", status: "New",
    assignedTo: "", responsiblePerson: "",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetch(`${API}/tickets/${id}`)
      .then(r => r.json())
      .then(d => {
        const t = d.data
        if (t) setForm({
          title: t.title ?? "", description: t.description ?? "",
          department: t.department ?? "", issueType: t.issueType ?? "",
          location: t.location ?? "", priority: t.priority ?? "Medium",
          status: t.status ?? "New", assignedTo: t.assignedTo ?? "",
          responsiblePerson: t.responsiblePerson ?? "",
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error("Title is required"); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("updatedBy", CURRENT_USER.id)
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      const res = await fetch(`${API}/tickets/${id}`, { method: "PUT", body: fd })
      if (res.ok) { toast.success("Ticket updated!"); navigate(`/tickets/${id}`) }
      else toast.error("Failed to update ticket")
    } catch { toast.error("Network error") }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center py-32 text-slate-400 text-sm">Loading…</div>
    </AppShell>
  )

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "All Requests", path: "/tickets" }, { label: `Edit #${String(id).padStart(6, "0")}` }]}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Edit Request</h1>
            <p className="text-xs text-slate-500">#{String(id).padStart(6, "0")}</p>
          </div>
        </div>

        <Card>
          <CardBody className="py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Priority" required>
                <select className={inputCls} value={form.priority} onChange={set("priority")}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={set("status")}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Issue Type">
                <select className={inputCls} value={form.issueType} onChange={set("issueType")}>
                  <option value="">— Select —</option>
                  {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Location">
                <select className={inputCls} value={form.location} onChange={set("location")}>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Department / Group">
                <select className={inputCls} value={form.department} onChange={set("department")}>
                  <option value="">— Select Department —</option>
                  {(departments as string[]).map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Assigned To">
                <select className={inputCls} value={form.assignedTo} onChange={set("assignedTo")}>
                  <option value="">— Not Assigned —</option>
                  {(users as Array<{ id: string; name: string }>).map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Title" required>
              <input className={inputCls} value={form.title} onChange={set("title")} placeholder="Brief summary…" required />
            </Field>

            <Field label="Description">
              <textarea className={`${inputCls} resize-none`} rows={5} value={form.description} onChange={set("description")} placeholder="Detailed description…" />
            </Field>

            <Field label="Responsible Person">
              <select className={inputCls} value={form.responsiblePerson} onChange={set("responsiblePerson")}>
                <option value="">— Select —</option>
                {(users as Array<{ id: string; name: string }>).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </AppShell>
  )
}
