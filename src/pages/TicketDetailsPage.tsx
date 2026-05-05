import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import users from "../data/users.json";

const TicketDetailsPage = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/tickets/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data.data);
        setAssignedTo(data.data.assigned_to || "");
        setStatus(data.data.status || "New");
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load ticket details");
        setLoading(false);
      });
  }, [id]);

  // Get user name by id
  const getUserName = (uid: string) => {
    const user = users.find((u) => u.id === uid);
    return user ? user.name : uid;
  };

  // Get users by department
  const getUsersByDepartment = (dept: string) => {
    return users.filter((u) => u.department === dept);
  };

  // Stage options with dot color
  const statusOptions = [
    { value: "New", label: "New", dot: "#1976d2" },
    { value: "Opened", label: "Opened", dot: "#0288d1" },
    { value: "Inprogress", label: "In Progress", dot: "#ff9800" },
    { value: "Onhold", label: "On Hold", dot: "#9e9e9e" },
    { value: "Resolved", label: "Resolved", dot: "#388e3c" },
    { value: "Closed", label: "Closed", dot: "#2e7d32" },
    { value: "Reopen", label: "Re-open", dot: "#d32f2f" },
  ];

  // Save assignment or status
  const handleSave = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      await fetch(`http://localhost:3001/api/v1/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: assignedTo, status }),
      });
      setTicket({ ...ticket, assigned_to: assignedTo, status });
    } catch (e) {
      setError("Failed to update ticket");
    }
    setSaving(false);
  };
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <h2>Ticket Details</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}
        {ticket && (
          <div className="ticket-details-container">
            <div className="details-card">
              <h3 className="ticket-title">#{ticket.id} - {ticket.title}</h3>
              <div className="details-grid">
                <div><span>Department</span><p>{ticket.department}</p></div>
                <div>
                  <span>Stage</span>
                  <div className="stage-dropdown-wrapper">
                    <span
                      className="stage-dot"
                      style={{ background: statusOptions.find(s => s.value === status)?.dot }}
                    ></span>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="stage-dropdown"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <span>Assigned To</span>
                  <select
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    style={{ minWidth: 120, padding: '4px 10px', borderRadius: 6 }}
                  >
                    <option value="">Unassigned</option>
                    {getUsersByDepartment(ticket.department).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div><span>Raised By</span><p>{getUserName(ticket.created_by)}</p></div>
                <div><span>Priority</span><p>{ticket.priority || "-"}</p></div>
                <div><span>Location</span><p>{ticket.location}</p></div>
                <div><span>SLA (Deadline)</span><p>{ticket.deadline || ticket.sla || '-'}</p></div>
              </div>
              <div className="description-box">
                <span>Description</span>
                <p>{ticket.description || "No description provided"}</p>
              </div>
              <button className="save-btn" onClick={handleSave} disabled={saving} style={{marginTop: 20}}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsPage;
