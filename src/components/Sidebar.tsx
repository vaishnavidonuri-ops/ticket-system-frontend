import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h3>Menu</h3>
      <p onClick={() => navigate("/")}>Dashboard</p>
      <p onClick={() => navigate("/create-ticket")}>Create Ticket</p>
    </div>
  );
};

export default Sidebar;