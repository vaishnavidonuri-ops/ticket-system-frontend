import { BrowserRouter, Routes, Route } from "react-router-dom"
import DashboardPage from "./pages/DashboardPage"
import TicketListPage from "./pages/TicketListPage"
import TicketDetailPage from "./pages/TicketDetailPage"
import CreateTicketPage from "./pages/CreateTicketPage"
import EditTicketPage from "./pages/EditTicketPage"
import MyTicketsPage from "./pages/MyTicketsPage"
import SlaPage from "./pages/SlaPage"

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/tickets" element={<TicketListPage />} />
      <Route path="/tickets/new" element={<CreateTicketPage />} />
      <Route path="/tickets/:id" element={<TicketDetailPage />} />
      <Route path="/tickets/:id/edit" element={<EditTicketPage />} />
      <Route path="/create-ticket" element={<CreateTicketPage />} />
      <Route path="/my-tickets" element={<MyTicketsPage />} />
      <Route path="/sla" element={<SlaPage />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes
