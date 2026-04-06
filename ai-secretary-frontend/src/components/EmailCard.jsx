import { useState } from "react";
import PriorityBadge from "./PriorityBadge";
import { addEmailToCalendar } from "../api/calendar";

function getInitials(from) {
  if (!from) return "?";
  const name = from.replace(/<.*?>/, "").trim();
  const parts = name.split(" ");
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "");
}

function getAvatarColor(from) {
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
  let hash = 0;
  for (let i = 0; i < (from || "").length; i++) hash += from.charCodeAt(i);
  return colors[hash % colors.length];
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function EmailCard({ email, isSelected, onClick }) {
  const [calLoading, setCalLoading] = useState(false);
  const [calAdded, setCalAdded] = useState(email.calendarEventAdded || false);

  const initials = getInitials(email.from).toUpperCase() || "?";
  const avatarColor = getAvatarColor(email.from);

  const handleAddToCalendar = async (e) => {
    e.stopPropagation();
    if (calAdded || calLoading) return;
    setCalLoading(true);
    try {
      await addEmailToCalendar(email._id);
      setCalAdded(true);
    } catch (err) {
      console.error("Calendar add failed:", err);
    } finally {
      setCalLoading(false);
    }
  };

  return (
    <div
      className={`email-card ${isSelected ? "email-card--selected" : ""} ${email.priority === "high" ? "email-card--high" : ""}`}
      onClick={onClick}
    >
      <div className="email-card__avatar" style={{ background: avatarColor }}>
        {initials}
      </div>

      <div className="email-card__body">
        <div className="email-card__top">
          <span className="email-card__from">{email.from?.replace(/<.*?>/, "").trim() || "Unknown"}</span>
          <span className="email-card__date">{formatDate(email.date)}</span>
        </div>

        <div className="email-card__subject">{email.subject || "(No Subject)"}</div>

        {email.summary && (
          <p className="email-card__preview">{email.summary.slice(0, 100)}…</p>
        )}

        <div className="email-card__footer">
          <PriorityBadge priority={email.priority} actionRequired={email.actionRequired} />

          {email.hasMeeting && (
            <button
              className={`cal-chip ${calAdded ? "cal-chip--done" : ""}`}
              onClick={handleAddToCalendar}
              disabled={calAdded || calLoading}
            >
              {calLoading ? "⏳" : calAdded ? "✅ In Calendar" : "🗓 Add to Calendar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
