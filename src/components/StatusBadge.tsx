const STATUS_CFG: Record<string, { cls: string; dot: string }> = {
  "New":         { cls: "badge-new",        dot: "#1565c0" },
  "Open":        { cls: "badge-open",       dot: "#1565c0" },
  "In Progress": { cls: "badge-inprogress", dot: "#e65100" },
  "Resolved":    { cls: "badge-resolved",   dot: "#2e7d32" },
  "Closed":      { cls: "badge-closed",     dot: "#546e7a" },
  "Pending":     { cls: "badge-pending",    dot: "#6a1a9a" },
};

const PRIORITY_CFG: Record<string, { cls: string; dot: string }> = {
  "Low":      { cls: "badge-low",      dot: "#2e7d32" },
  "Normal":   { cls: "badge-normal",   dot: "#1565c0" },
  "Medium":   { cls: "badge-medium",   dot: "#f57f17" },
  "High":     { cls: "badge-high",     dot: "#e65100" },
  "Critical": { cls: "badge-critical", dot: "#b71c1c" },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] || { cls: "badge-closed", dot: "#546e7a" };
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className="badge-dot" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const cfg = PRIORITY_CFG[priority] || { cls: "badge-normal", dot: "#1565c0" };
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className="badge-dot" style={{ background: cfg.dot }} />
      {priority}
    </span>
  );
};
