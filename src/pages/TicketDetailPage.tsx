import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Edit2, UserCheck, Trash2, MessageSquare, Clock, Info, CheckCircle } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardBody } from "@/components/ui/card"
import { StatusBadge, PriorityBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { API, CURRENT_USER, formatDateTime, getInitials } from "@/lib/utils"
import users from "@/data/users.json"

const getUser = (id: string) => (users as Array<{ id: string; name: string }>).find(u => u.id === id)

type Tab = "conversations" | "details" | "timeline"

const AVATAR_COLORS = ["#1565c0", "#6a1a9a", "#2e7d32", "#e65100", "#0277bd"]
const avatarColor = (s: string) => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [ticket,   setTicket]   = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [history,  setHistory]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab, setTab]           = useState<Tab>("conversations")

  const [replyText, setReplyText] = useState("")
  const [replying,  setReplying]  = useState(false)

  const [statusModal, setStatusModal] = useState(false)
  const [assignModal, setAssignModal] = useState(false)
  const [newStatus,   setNewStatus]   = useState("")
  const [newAssignee, setNewAssignee] = useState("")
  const [saving,      setSaving]      = useState(false)

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

  const handleStatusChange = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API}/tickets/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, updatedBy: CURRENT_USER.id }),
      })
      if (res.ok) { toast.success(`Status updated to ${newStatus}`); setStatusModal(false); fetchTicket() }
      else toast.error("Failed to update status")
    } finally { setSaving(false) }
  }

  const handleAssign = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API}/tickets/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: newAssignee || undefined, updatedBy: CURRENT_USER.id }),
      })
      if (res.ok) { toast.success("Assignment updated"); setAssignModal(false); fetchTicket() }
      else toast.error("Failed to assign")
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this ticket permanently?")) return
    const res = await fetch(`${API}/tickets/${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Ticket deleted"); navigate("/tickets") }
    else toast.error("Delete failed")
  }

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

  const ticketNum = ticket.ticketNumber ?? `#${String(ticket.id).padStart(6, "0")}`

  const TABS: { key: Tab; label: string; icon: typeof MessageSquare }[] = [
    { key: "conversations", label: "Conversations", icon: MessageSquare },
    { key: "details",       label: "Details",       icon: Info },
    { key: "timeline",      label: "Timeline",      icon: Clock },
  ]

  const DetailRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex gap-2 py-2 border-b border-slate-100 last:border-0">
      <span className="w-36 shrink-0 text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-xs text-slate-700">{value || "—"}</span>
    </div>
  )

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "All Requests", path: "/tickets" }, { label: ticketNum }]}>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => navigate("/tickets")} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/tickets/${id}/edit`)}>
            <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { setNewAssignee(ticket.assignedTo ?? ""); setAssignModal(true) }}>
            <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Assign
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { setNewStatus(ticket.status); setStatusModal(true) }}>
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Change Status
          </Button>
          <div className="flex-1" />
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: ticket body */}
          <div className="lg:col-span-2 space-y-4">
            {/* Ticket header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="text-slate-400 shrink-0 mt-0.5">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-blue-600 font-semibold">{ticketNum}</span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority ?? "Medium"} />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">{ticket.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    By <strong>{getUser(ticket.createdBy)?.name ?? ticket.createdBy}</strong>
                    {ticket.department ? ` · ${ticket.department}` : ""}
                    {ticket.issueType ? ` · ${ticket.issueType}` : ""}
                    {" · "}{formatDateTime(ticket.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
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
                {/* ─ Conversations ─ */}
                {tab === "conversations" && (
                  <div className="space-y-4">
                    {ticket.description && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: avatarColor(ticket.createdBy ?? "A") }}>
                          {getInitials(getUser(ticket.createdBy)?.name ?? "?")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-800">{getUser(ticket.createdBy)?.name ?? ticket.createdBy}</span>
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
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: avatarColor(c.userId ?? "B") }}>
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

                    {/* Reply box */}
                    <div className="mt-4 space-y-2">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your reply…"
                        className="w-full text-sm border border-slate-200 rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                      />
                      <div className="flex justify-end">
                        <Button variant="primary" size="sm" onClick={handleReply} disabled={replying || !replyText.trim()}>
                          {replying ? "Sending…" : "Reply"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─ Details ─ */}
                {tab === "details" && (
                  <div className="space-y-1">
                    <DetailRow label="Ticket ID"     value={ticketNum} />
                    <DetailRow label="Status"        value={ticket.status} />
                    <DetailRow label="Priority"      value={ticket.priority} />
                    <DetailRow label="Issue Type"    value={ticket.issueType} />
                    <DetailRow label="Department"    value={ticket.department} />
                    <DetailRow label="Location"      value={ticket.location} />
                    <DetailRow label="Requested By"  value={getUser(ticket.createdBy)?.name} />
                    <DetailRow label="Assigned To"   value={ticket.assignedTo ? getUser(ticket.assignedTo)?.name : undefined} />
                    <DetailRow label="Responsible"   value={ticket.responsiblePerson ? getUser(ticket.responsiblePerson)?.name : undefined} />
                    <DetailRow label="Created At"    value={formatDateTime(ticket.createdAt)} />
                    <DetailRow label="Last Updated"  value={formatDateTime(ticket.updatedAt)} />
                    {ticket.slaId && <DetailRow label="SLA Rule" value={`SLA #${ticket.slaId}`} />}
                  </div>
                )}

                {/* ─ Timeline ─ */}
                {tab === "timeline" && (
                  <div className="space-y-0">
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
                            <strong className="text-slate-700">{h.updatedByName ?? h.updatedBy}</strong>
                            {" "}
                            {h.action === "TICKET_CREATED" ? "created this ticket" : (
                              <>changed <strong>{h.field}</strong> from <em>"{h.oldValue || "—"}"</em> to <em>"{h.newValue}"</em></>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(h.updatedAt ?? h.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: sidebar info */}
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Request Info</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Priority</span>
                  <PriorityBadge priority={ticket.priority ?? "Medium"} />
                </div>
                {ticket.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Department</span>
                    <span className="text-xs text-slate-700">{ticket.department}</span>
                  </div>
                )}
                {ticket.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Location</span>
                    <span className="text-xs text-slate-700">{ticket.location}</span>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* People */}
            <Card>
              <CardBody className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">People</div>
                {[
                  { label: "Requester", id: ticket.createdBy },
                  { label: "Technician", id: ticket.assignedTo },
                  { label: "Responsible", id: ticket.responsiblePerson },
                ].map(({ label, id: uid }) => {
                  const u = uid ? getUser(uid) : null
                  return (
                    <div key={label} className="flex items-center gap-2.5">
                      {u ? (
                        <>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{ background: avatarColor(uid ?? "X") }}>
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-700">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{label}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 shrink-0" />
                          <div className="text-xs text-slate-400">{label}: Not assigned</div>
                        </>
                      )}
                    </div>
                  )
                })}
              </CardBody>
            </Card>

            {/* Attachments */}
            {ticket.attachments?.length > 0 && (
              <Card>
                <CardBody>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Attachments</div>
                  <div className="space-y-1.5">
                    {ticket.attachments.map((a: any, i: number) => (
                      <a key={i} href={a.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                        📎 {a.originalName ?? `File ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Status modal */}
      <Dialog
        open={statusModal}
        onClose={() => setStatusModal(false)}
        title="Change Status"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setStatusModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleStatusChange} disabled={saving}>{saving ? "Saving…" : "Update"}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">New Status</label>
          <select
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
          >
            {["New", "In Progress", "Resolved", "Closed"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Dialog>

      {/* Assign modal */}
      <Dialog
        open={assignModal}
        onClose={() => setAssignModal(false)}
        title="Assign Ticket"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAssignModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAssign} disabled={saving}>{saving ? "Saving…" : "Assign"}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Assign To</label>
          <select
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
            value={newAssignee}
            onChange={e => setNewAssignee(e.target.value)}
          >
            <option value="">— Not Assigned —</option>
            {(users as Array<{ id: string; name: string }>).map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </Dialog>
    </AppShell>
  )
}
