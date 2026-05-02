import { useNavigate } from "react-router-dom";

const CURRENT_USER = { id: "EMP001", name: "Alice Johnson", avatar: "AJ" };

const Header = ({ title: _title }: { title?: string }) => {
  const navigate = useNavigate();

  return (
    <header className="top-header">
      {/* Brand */}
      <span className="header-logo-text">visaka</span>
      <div className="header-divider" />

      {/* Search */}
      <div className="header-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9aa3b8" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search requests, assets, solutions…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) navigate(`/tickets?search=${encodeURIComponent(v)}`);
            }
          }}
        />
      </div>

      <div className="header-spacer" />

      {/* Icon buttons */}
      <button className="header-icon-btn" title="Quick create" onClick={() => navigate("/create-ticket")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      </button>

      <button className="header-icon-btn" title="Flash notifications">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </button>

      <button className="header-icon-btn" title="History">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4M3 3v5h5"/>
        </svg>
      </button>

      <button className="header-icon-btn" title="Notifications" style={{ position: "relative" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span className="header-notif-badge">12</span>
      </button>

      <button className="header-icon-btn" title="Help">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      {/* Avatar */}
      <div className="header-avatar" title={CURRENT_USER.name}>{CURRENT_USER.avatar}</div>
    </header>
  );
};

export default Header;
