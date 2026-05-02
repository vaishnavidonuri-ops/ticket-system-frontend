import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X, FileText } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardBody } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { API, CURRENT_USER } from "@/lib/utils"
import departments from "@/data/departments.json"
import users from "@/data/users.json"

const ISSUE_TYPES = ["Hardware", "Software", "Network", "HR", "Facilities", "Finance", "General", "Security", "Account/Access"]
const PRIORITIES  = ["Low", "Medium", "High", "Critical"]
const STATUSES    = ["New", "In Progress"]
const LOCATIONS   = ["Base Site", "HO Secunderabad", "Garhmukeshwar Depot", "Vizag Plant", "Hyderabad Office"]

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

const inputCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles]   = useState<File[]>([])
  const [dragging, setDragging] = useState(false)

  const [form, setForm] = useState({
    title:             "",
    description:       "",
    department:        "",
    issueType:         "",
    priority:          "Medium",
    status:            "New",
    location:          "Base Site",
    assignedTo:        "",
    responsiblePerson: "",
    createdBy:         CURRENT_USER.id,
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const addFiles = (incoming: File[]) =>
    setFiles(prev => [...prev, ...incoming.filter(f => !prev.find(p => p.name === f.name))])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error("Title is required"); return }

    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      files.forEach(f => fd.append("attachments", f))

      const res  = await fetch(`${API}/tickets`, { method: "POST", body: fd })
      const data = await res.json()

      if (res.ok) {
        toast.success("Request created successfully!")
        setTimeout(() => navigate(`/tickets/${data.data?.id ?? ""}`), 700)
      } else {
        toast.error(data.message ?? "Failed to create request")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "All Requests", path: "/tickets" }, { label: "New Incident" }]}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">New Incident</h1>
            <p className="text-xs text-slate-500">Submit a new IT support request</p>
          </div>
        </div>

        {/* Quick settings row */}
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

        {/* Main form */}
        <Card>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Department / Group" required>
                <select className={inputCls} value={form.department} onChange={set("department")} required>
                  <option value="">— Select Department —</option>
                  {(departments as string[]).map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Assigned Technician">
                <select className={inputCls} value={form.assignedTo} onChange={set("assignedTo")}>
                  <option value="">— Not Assigned —</option>
                  {(users as Array<{ id: string; name: string; designation?: string }>).map(u => (
                    <option key={u.id} value={u.id}>{u.name}{u.designation ? ` (${u.designation})` : ""}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Subject / Title" required>
              <input
                className={inputCls}
                placeholder="Brief summary of the issue…"
                value={form.title}
                onChange={set("title")}
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                className={`${inputCls} resize-none`}
                rows={5}
                placeholder="Describe the issue in detail…"
                value={form.description}
                onChange={set("description")}
              />
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

        {/* Attachments */}
        <Card>
          <CardBody>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Attachments</p>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)) }}
              onClick={() => document.getElementById("att-input")?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <Upload className="h-6 w-6 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Drag &amp; drop files here, or <span className="text-blue-600 font-medium">browse</span></p>
              <p className="text-xs text-slate-400 mt-1">Images, PDFs, documents up to 10MB</p>
              <input id="att-input" type="file" multiple className="hidden" onChange={e => addFiles(Array.from(e.target.files ?? []))} />
            </div>

            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-700">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span className="max-w-[160px] truncate">{f.name}</span>
                    <button type="button" onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="button" variant="secondary" onClick={() => setForm(f => ({ ...f, title: "", description: "", department: "", issueType: "", assignedTo: "", responsiblePerson: "" }))}>
            Reset
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Add Request"}
          </Button>
        </div>
      </form>
    </AppShell>
  )
}
