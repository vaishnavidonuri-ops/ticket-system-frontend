import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Edit2, Trash2, MessageSquare, Clock, Info, ZoomIn, X } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardBody } from "@/components/ui/card"
import { StatusBadge, PriorityBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { API, CURRENT_USER, formatDateTime, getInitials } from "@/lib/utils"
import users from "@/data/users.json"
import departments from "@/data/departments.json"

type Tab = "conversations" | "details" | "timeline"

const USERS = users as Array<{ id: string; name: string }>
const DEPTS = departments as string[]

const getUser  = (id: string) => USERS.find(u => u.id === id)
const getUrl   = (a: any) => typeof a === "string" ? a : (a?.url ?? a?.secure_url ?? "")
const isImage  = (url: string) => /\.(jpg|jpeg|png|gif|webp)/i.test(url) || url.includes("cloudinary")

const AVATAR_COLORS = ["#1565c0", "#6a1a9a", "#2e7d32", "#e65100", "#0277bd"]
const avatarColor = (s: string) => AVATAR_COLORS[(s?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

// ─── Inline dropdown for REQUEST INFO ─────────────────────────────────────────
const InfoSelect = ({
  label, value, options, onChange, disabled, emptyLabel,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
  disabled?: boolean; emptyLabel?: string
}) => (
  <div className="py-2.5 border-b border-slate-100 last:border-0">
    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
    <select
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700
                 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100
                 disabled:opacity-50 transition-all cursor-pointer"
    >
      {emptyLabel && <option value="">{emptyLabel}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
)

// ─── Inline person dropdown ────────────────────────────────────────────────────
const PersonSelect = ({
  label, value, onChange, disabled, readOnly,
}: {
  label: string; value: string; onChange?: (v: string) => void
  disabled?: boolean; readOnly?: boolean
}) => {
  const u = value ? getUser(value) : null
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-slate-100 last:border-0">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: u ? avatarColor(value) : "#cbd5e1" }}
      >
        {u ? getInitials(u.name) : "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-slate-400 font-medium mb-0.5">{label}</div>
        {readOnly ? (
          <div className="text-xs font-semibold text-slate-700">{u?.name ?? "—"}</div>
        ) : (
          <select
            value={value ?? ""}
            onChange={e => onChange?.(e.target.value)}
            disabled={disabled}
            className="w-full text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700
                       focus:outline-none focus:border-blue-400 disabled:opacity-50 transition-all"
          >
            <option value="">— Not assigned —</option>
            {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
      </div>
    </div>
  )
}

export default function TicketDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [ticket,   setTicket]   = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [history,  setHistory]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [tab,      setTab]      = useState<Tab>("conversations")
  const [replyText, setReplyText] = useState("")
  const [replying,  setReplying]  = useState(false)
  const [lightbox,  setLightbox]  = useState<string | null>(null)

  const fetchTicket = async () => {
    setLoading(true)
    try {
      const [tRes, cRes, hRes] = await Promise.all([
        fetch(`${API}/tickets/${id}`),
        fetch(`${API}/tickets/${id}/comments`),
        fetch(`${API}/tickets/${id}/history`),
      ])
      if (tRes.ok) setTicket((await tRes.json()).data)
      if (cRes.ok) setComments((await cRes.json()).data ?? [])
      if (hRes.ok) setHistory((await hRes.json()).data ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTicket() }, [id])

  // ── Inline status change ────────────────────────────────────────────────────
  const updateStatus = async (status: string) => {
    setTicket((t: any) => ({ ...t, status }))          // optimistic
    setSaving(true)
    try {
      const res = await fetch(`${API}/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, updatedBy: CURRENT_USER.id }),
      })
      if (res.ok) toast.success(`Status → ${status}`)
      else { toast.error("Failed to update status"); fetchTicket() }
    } finally { setSaving(false) }
  }

  // ── Inline field update (priority / department / location) ─────────────────
  const updateField = async (field: string, value: string) => {
    setTicket((t: any) => ({ ...t, [field]: value }))  // optimistic
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append(field, value)
      fd.append("updatedBy", CURRENT_USER.id)
      const res = await fetch(`${API}/tickets/${id}`, { method: "PUT", body: fd })
      if (res.ok) toast.success("Updated")
      else { toast.error("Failed to update"); fetchTicket() }
    } finally { setSaving(false) }
  }

  // ── Inline assign (technician / responsible) ────────────────────────────────
  const updateAssign = async (field: "assignedTo" | "responsiblePerson", value: string) => {
    setTicket((t: any) => ({ ...t, [field]: value }))  // optimistic
    setSaving(true)
    try {
      const body: any = { updatedBy: CURRENT_USER.id }
      if (field === "assignedTo")        body.assignedTo        = value || undefined
      if (field === "responsiblePerson") body.responsiblePerson = value || undefined
      const res = await fetch(`${API}/tickets/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) toast.success("Assignment updated")
      else { toast.error("Failed to assign"); fetchTicket() }
    } finally { setSaving(false) }
  }

  // ── Add reply ───────────────────────────────────────────────────────────────
  const handleReply = async () => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      const res = await fetch(`${API}/tickets/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: CURRENT_USER.id, userName: CURRENT_USER.name, content: replyText.trim() }),
      })
      if (res.ok) {
        const json = await res.json()
        setComments(prev => [...prev, json.data])
        setReplyText("")
        toast.success("Reply added")
      } else toast.error("Failed to post reply")
    } finally { setReplying(false) }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Delete this ticket permanently?")) return
    const res = await fetch(`${API}/tickets/${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Ticket deleted"); navigate("/tickets") }
    else toast.error("Delete failed")
  }

  // ── Loading / not found ─────────────────────────────────────────────────────
  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center py-32 text-slate-400 text-sm">Loading ticket…</div>
    </AppShell>
  )
  if (!ticket) return (
    <AppShell>
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="text-4xl">🚫</div>
        <div className="text-slate-600 font-medium">Ticket not found</div>
        <Button onClick={() => navigate("/tickets")}>Back to Requests</Button>
      </div>
    </AppShell>
  )

  const ticketNum  = ticket.ticketNumber ?? `#${String(ticket.id).padStart(6, "0")}`
  const attachUrls: string[] = (ticket.attachments ?? []).map(getUrl).filter(Boolean)
  const imgUrls    = attachUrls.filter(isImage)

  const TABS: { key: Tab; label: string; icon: typeof MessageSquare }[] = [
    { key: "conversations", label: "Conversations", icon: MessageSquare },
    { key: "details",       label: "Details",       icon: Info },
    { key: "timeline",      label: "Timeline",      icon: Clock },
  ]

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "All Requests", path: "/tickets" }, { label: ticketNum }]}>
      <div className="space-y-4">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => navigate("/tickets")} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/tickets/${id}/edit`)}>
            <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
          <div className="flex-1" />
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── LEFT: main content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Ticket header card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono text-blue-600 font-semibold">{ticketNum}</span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority ?? "Medium"} />
              </div>
              <h2 className="text-base font-bold text-slate-800">{ticket.title}</h2>
              <p className="text-xs text-slate-500 mt-1">
                By <strong>{getUser(ticket.createdBy)?.name ?? ticket.createdBy}</strong>
                {ticket.department ? ` · ${ticket.department}` : ""}
                {ticket.issueType  ? ` · ${ticket.issueType}`  : ""}
                {" · "}{formatDateTime(ticket.createdAt)}
              </p>

              {/* ── Attachment images right under the title ── */}
              {imgUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Attachments ({imgUrls.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {imgUrls.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(url)}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200
                                   hover:border-blue-400 transition-all group shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors
                                        flex items-center justify-center">
                          <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      tab === key
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                    {key === "conversations" && comments.length > 0 && (
                      <span className="ml-1 bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {comments.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Conversations */}
                {tab === "conversations" && (
                  <div className="space-y-4">
                    {ticket.description && (
                      <div className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: avatarColor(ticket.createdBy ?? "A") }}
                        >
                          {getInitials(getUser(ticket.createdBy)?.name ?? "?")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-800">
                              {getUser(ticket.createdBy)?.name ?? ticket.createdBy}
                            </span>
                            <span className="text-xs text-slate-400">{formatDateTime(ticket.createdAt)}</span>
                          </div>
                          <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap">
                            {ticket.description}
                          </div>
                        </div>
                      </div>
                    )}

                    {comments.map((c: any) => (
                      <div key={c.id} className="flex gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: avatarColor(c.userId ?? "B") }}
                        >
                          {getInitials(c.userName ?? "?")}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-800">{c.userName}</span>
                            <span className="text-xs text-slate-400">{formatDateTime(c.createdAt)}</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap">
                            {c.content}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="mt-2 space-y-2">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your reply…"
                        className="w-full text-sm border border-slate-200 rounded-lg px-4 py-2.5 resize-none
                                   focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                      />
                      <div className="flex justify-end">
                        <Button variant="primary" size="sm" onClick={handleReply} disabled={replying || !replyText.trim()}>
                          {replying ? "Sending…" : "Reply"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Details */}
                {tab === "details" && (
                  <div>
                    {[
                      { label: "Ticket ID",    value: ticketNum },
                      { label: "Issue Type",   value: ticket.issueType },
                      { label: "Location",     value: ticket.location },
                      { label: "Created At",   value: formatDateTime(ticket.createdAt) },
                      { label: "Last Updated", value: formatDateTime(ticket.updatedAt) },
                      ...(ticket.slaId ? [{ label: "SLA Rule", value: `SLA #${ticket.slaId}` }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-2 py-2 border-b border-slate-100 last:border-0">
                        <span className="w-32 shrink-0 text-xs text-slate-400 font-medium">{label}</span>
                        <span className="text-xs text-slate-700">{value || "—"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timeline */}
                {tab === "timeline" && (
                  <div>
                    {history.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm">No history yet</div>
                    ) : history.map((h: any, i: number) => (
                      <div key={h.id ?? i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                          {i < history.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                        </div>
                        <div className="pb-4">
                          <div className="text-xs text-slate-500">
                            <strong className="text-slate-700">{h.updatedByName ?? h.updatedBy}</strong>{" "}
                            {h.action === "TICKET_CREATED" ? "created this ticket" : (
                              <>changed <strong>{h.field}</strong> from <em>"{h.oldValue || "—"}"</em> to <em>"{h.newValue}"</em></>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {formatDateTime(h.updatedAt ?? h.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* REQUEST INFO — all editable inline */}
            <Card>
              <CardBody className="px-4 py-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Request Info</p>

                <InfoSelect
                  label="Status"
                  value={ticket.status}
                  options={["New", "In Progress", "Resolved", "Closed"]}
                  onChange={updateStatus}
                  disabled={saving}
                />
                <InfoSelect
                  label="Priority"
                  value={ticket.priority ?? "Medium"}
                  options={["Low", "Medium", "High", "Critical"]}
                  onChange={v => updateField("priority", v)}
                  disabled={saving}
                />
                <InfoSelect
                  label="Department"
                  value={ticket.department ?? ""}
                  options={DEPTS}
                  emptyLabel="— Select —"
                  onChange={v => updateField("department", v)}
                  disabled={saving}
                />

                {ticket.location && (
                  <div className="py-2.5 border-b border-slate-100 last:border-0">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Location</div>
                    <div className="text-xs text-slate-700">{ticket.location}</div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* PEOPLE — editable inline */}
            <Card>
              <CardBody className="px-4 py-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">People</p>

                <PersonSelect
                  label="Requester"
                  value={ticket.createdBy ?? ""}
                  readOnly
                />
                <PersonSelect
                  label="Technician"
                  value={ticket.assignedTo ?? ""}
                  onChange={v => updateAssign("assignedTo", v)}
                  disabled={saving}
                />
                <PersonSelect
                  label="Responsible"
                  value={ticket.responsiblePerson ?? ""}
                  onChange={v => updateAssign("responsiblePerson", v)}
                  disabled={saving}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Image Lightbox ──────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                       flex items-center justify-center text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Attachment preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </AppShell>
  )
}
