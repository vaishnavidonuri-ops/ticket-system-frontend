const TicketTable = () => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Department</th>
          <th>Issue</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Assigned</th>
        </tr>
      </thead>

      <tbody>
        {[1,2,3,4].map((_, i) => (
          <tr key={i}>
            <td>#T-100{i}</td>
            <td>IT Support</td>
            <td>Browser Crash</td>
            <td>High</td>
            <td>Open</td>
            <td>Sarah</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TicketTable;