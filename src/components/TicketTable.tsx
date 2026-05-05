import { useNavigate } from "react-router-dom";
import users from "../data/users.json";

type Ticket = {
  id: number;
  title: string;
  department: string;
  status: string;
  assignedTo?: string;
  createdBy?: string; 
};

const TicketTable = ({ tickets }: { tickets: Ticket[] }) => {
  const navigate = useNavigate();
  const getUserName = (id?: string) => {
    if (!id) return "Unassigned";

    const user = users.find((u) => u.id === id);
    return user ? user.name : id;
  };
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Department</th>
          <th>Issue</th>
          <th>Status</th>
          <th>Assigned</th>
          <th>CreatedBy</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => (
          <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/ticket/${t.id}`)}>
            <td>#T-{t.id}</td>
            <td>{t.department}</td>
            <td>{t.title}</td>
            <td>{t.status}</td>
            <td>{t.assignedTo || "Unassigned"}</td>
            <td>{getUserName(t.createdBy)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TicketTable;