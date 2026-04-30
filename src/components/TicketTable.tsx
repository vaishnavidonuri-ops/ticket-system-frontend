type Ticket = {
  id: number;
  title: string;
  department: string;
  status: string;
  assignedTo?: string;
};

const TicketTable = ({ tickets }: { tickets: Ticket[] }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Department</th>
          <th>Issue</th>
          <th>Status</th>
          <th>Assigned</th>
        </tr>
      </thead>

      <tbody>
        {tickets.map((t) => (
          <tr key={t.id}>
            <td>#T-{t.id}</td>
            <td>{t.department}</td>
            <td>{t.title}</td>
            <td>{t.status}</td>
            <td>{t.assignedTo || "Unassigned"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TicketTable;