const ACTION_CONFIG: Record<string, { label: string; dot: string }> = {
  TICKET_CREATED:    { label: "Ticket Created",        dot: "timeline-dot-created" },
  STATUS_CHANGED:    { label: "Status Changed",        dot: "timeline-dot-status" },
  ASSIGNED:          { label: "Ticket Assigned",       dot: "timeline-dot-assigned" },
  RESPONSIBLE_CHANGED: { label: "Responsible Person Changed", dot: "timeline-dot-assigned" },
  FIELD_UPDATED:     { label: "Field Updated",         dot: "timeline-dot-updated" },
  COMMENT_ADDED:     { label: "Comment Added",         dot: "timeline-dot-comment" }
};

const formatDate = (d: string) => {
  if (!d) return "";
  return new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

interface HistoryEntry {
  id: number;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  updatedBy: string;
  updatedByName?: string;
  createdAt: string;
}

const HistoryTimeline = ({ history }: { history: HistoryEntry[] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <div className="empty-state-title">No history yet</div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {history.map((entry) => {
        const config = ACTION_CONFIG[entry.action] || { label: entry.action, dot: "timeline-dot-default" };
        return (
          <div className="timeline-item" key={entry.id}>
            <div className={`timeline-dot ${config.dot}`} />
            <div className="timeline-content">
              <div className="timeline-action">{config.label}</div>
              {entry.field && (
                <div className="timeline-detail">
                  <b>{entry.field}:</b>{" "}
                  {entry.oldValue && (
                    <span style={{ textDecoration: "line-through", opacity: 0.6, marginRight: 6 }}>
                      {entry.oldValue}
                    </span>
                  )}
                  {entry.newValue && <span style={{ fontWeight: 600 }}>{entry.newValue}</span>}
                </div>
              )}
              {entry.action === "COMMENT_ADDED" && entry.newValue && (
                <div className="timeline-detail" style={{ fontStyle: "italic" }}>
                  "{entry.newValue.length > 80 ? entry.newValue.substring(0, 80) + "…" : entry.newValue}"
                </div>
              )}
              <div className="timeline-meta">
                <span className="timeline-user">{entry.updatedByName || entry.updatedBy}</span>
                <span style={{ color: "#dfe1e6", fontSize: 10 }}>•</span>
                <span className="timeline-time">{formatDate(entry.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryTimeline;
