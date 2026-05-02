import { useLocation, useNavigate } from "react-router-dom";

const NAV = [
  { path: "/",           icon: "🏠", label: "Home" },
  { path: "/activities", icon: "📋", label: "Activities" },
  { path: "/tickets",    icon: "📨", label: "Requests",  count: 0 },
  { path: "/assets",     icon: "🖥️", label: "Assets" },
  { path: "/sla",        icon: "📊", label: "Reports" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <svg viewBox="0 0 32 32" width="28" height="28">
            <rect width="32" height="32" rx="6" fill="#cc0000"/>
            <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Arial">V</text>
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">visaka</div>
          <span className="sidebar-logo-sub">IT Helpdesk</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <div
            key={item.path}
            className={`sidebar-item${isActive(item.path) ? " active" : ""}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className="badge-count">{item.count}</span>
            )}
          </div>
        ))}

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "8px 12px" }} />

        {/* Quick create */}
        <div
          className="sidebar-item"
          onClick={() => navigate("/create-ticket")}
          title="New Incident"
        >
          <span className="sidebar-item-icon">➕</span>
          <span className="sidebar-item-label">New Incident</span>
        </div>

        <div
          className="sidebar-item"
          onClick={() => navigate("/my-tickets")}
          title="My Tickets"
        >
          <span className="sidebar-item-icon">👤</span>
          <span className="sidebar-item-label">My Tickets</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
