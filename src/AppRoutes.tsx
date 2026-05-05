import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/create-ticket" element={<CreateTicketPage />} />
        <Route path="/ticket/:id" element={<TicketDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;