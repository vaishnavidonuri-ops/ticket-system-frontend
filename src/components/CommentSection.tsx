import { useState } from "react";

interface Comment {
  id: number;
  userId: string;
  userName?: string;
  content: string;
  createdAt: string;
}

const CURRENT_USER = { id: "EMP001", name: "Alice Johnson", avatar: "AJ" };

const formatDate = (d: string) =>
  new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

interface Props {
  ticketId: number;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
}

const CommentSection = ({ ticketId, comments, onCommentAdded }: Props) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3001/api/v1/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: CURRENT_USER.id,
          userName: CURRENT_USER.name,
          content: text.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        onCommentAdded(data.data);
        setText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Comment list */}
      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="empty-state" style={{ padding: "24px 0" }}>
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">No comments yet</div>
            <div className="empty-state-sub">Be the first to comment on this ticket.</div>
          </div>
        ) : (
          comments.map(c => (
            <div className="comment-item" key={c.id}>
              <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                {getInitials(c.userName || c.userId)}
              </div>
              <div className="comment-bubble">
                <div className="comment-header">
                  <span className="comment-author">{c.userName || c.userId}</span>
                  <span className="comment-time">{formatDate(c.createdAt)}</span>
                </div>
                <div className="comment-content">{c.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment */}
      <div className="comment-input-area">
        <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0, marginTop: 4 }}>
          {CURRENT_USER.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            className="comment-textarea"
            placeholder="Add a comment…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && e.ctrlKey) handleSubmit();
            }}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#97a0af", alignSelf: "center" }}>Ctrl+Enter to send</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
            >
              {submitting ? "Posting…" : "Comment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
