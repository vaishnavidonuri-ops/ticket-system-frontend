import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TicketTable from "../components/TicketTable";

const DashboardPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/v1/tickets/all")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data.data.rows); // ✅ correct mapping
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="layout">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* ✅ Main Area */}
      <div className="main">
        <Header />

        <h2>Dashboard</h2>

        <TicketTable tickets={tickets} />
      </div>
    </div>
  );
};

export default DashboardPage;