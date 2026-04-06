import { useEffect, useState } from "react";
import { getCalendarEvents } from "../api/calendar";

function formatEventTime(dateStr, isAllDay) {
  if (!dateStr) return "";
  if (isAllDay) return "All day";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatEventDate(dateStr, isAllDay) {
  if (!dateStr) return "";
  const d = new Date(isAllDay ? dateStr + "T00:00:00" : dateStr);
  const now = new Date();
  const diffDays = Math.floor((d - now) / 86400000);

  if (diffDays < 0) return "Past";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function getDayChipClass(dateStr, isAllDay) {
  const d = new Date(isAllDay ? dateStr + "T00:00:00" : dateStr);
  const now = new Date();
  const diffDays = Math.floor((d - now) / 86400000);
  if (diffDays < 0) return "day-chip day-chip--past";
  if (diffDays === 0) return "day-chip day-chip--today";
  if (diffDays === 1) return "day-chip day-chip--soon";
  return "day-chip";
}

export default function CalendarPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCalendarEvents(7)
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="cal-panel">
        <h2 className="cal-panel__title">📅 Upcoming</h2>
        <div className="cal-skeleton">
          {[1, 2, 3].map((i) => <div key={i} className="cal-skeleton__item" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cal-panel">
        <h2 className="cal-panel__title">📅 Upcoming</h2>
        <p className="cal-error">Calendar not available.<br />Re-login to grant calendar access.</p>
      </div>
    );
  }

  return (
    <div className="cal-panel">
      <h2 className="cal-panel__title">📅 Next 7 Days</h2>
      {events.length === 0 ? (
        <p className="cal-empty">No upcoming events 🎉</p>
      ) : (
        <div className="cal-events">
          {events.map((ev) => (
            <div key={ev.id} className={`cal-event ${ev.fromEmail ? "cal-event--from-email" : ""}`}>
              <div className="cal-event__left">
                <span className={getDayChipClass(ev.start, ev.isAllDay)}>
                  {formatEventDate(ev.start, ev.isAllDay)}
                </span>
                <span className="cal-event__time">{formatEventTime(ev.start, ev.isAllDay)}</span>
              </div>
              <div className="cal-event__right">
                <span className="cal-event__title">{ev.title}</span>
                {ev.location && <span className="cal-event__loc">📍 {ev.location}</span>}
                {ev.fromEmail && <span className="cal-event__tag">✉️ via AI</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
