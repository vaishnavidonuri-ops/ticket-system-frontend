import { useNavigate } from "react-router-dom";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import users from "../data/users.json";

type Ticket = {
  id: number;
  title: string;
  department?: string;
  issueType?: string;
  priority?: string;
  status: string;
  assignedTo?: string;
  createdAt?: string;
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";

const TicketTable = ({ tickets }: { tickets: Ticket[] }) => {
  const navigate = useNavigate();

  if (!tickets || tickets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎫</div>
        <div className="empty-state-title">No tickets</div>
      </div>
    );
  }

  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Department</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map(t => (
          <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/tickets/${t.id}`)}>
            <td><span className="ticket-id">TKT-{String(t.id).padStart(4, "0")}</span></td>
            <td>
              <span className="ticket-title-link">{t.title}</span>
              {t.issueType && <div style={{ fontSize: 11, color: "#97a0af", marginTop: 2 }}>{t.issueType}</div>}
            </td>
            <td style={{ color: "#5e6c84" }}>{t.department || "—"}</td>
            <td><PriorityBadge priority={t.priority || "Medium"} /></td>
            <td><StatusBadge status={t.status} /></td>
            <td>
              {t.assignedTo ? (
                <div className="avatar-chip">
                  <div className="avatar-circle">{t.assignedTo.substring(0, 2).toUpperCase()}</div>
                  {users.find(u => u.id === t.assignedTo)?.name || t.assignedTo}
                </div>
              ) : <span style={{ color: "#97a0af" }}>Unassigned</span>}
            </td>
            <td style={{ color: "#5e6c84", fontSize: 12 }}>{formatDate(t.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TicketTable;
