import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCards from "../components/StatsCards";
import TicketTable from "../components/TicketTable";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="layout">

      <Sidebar />

      <div className="main">
        <Header />

        <button className="create-btn" onClick={() => navigate("/create-ticket")}>
          Create New Ticket
        </button>

        <StatsCards />
        <TicketTable />
      </div>

    </div>
  );
};

export default DashboardPage;