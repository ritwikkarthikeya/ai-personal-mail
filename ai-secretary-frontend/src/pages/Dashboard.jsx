import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import EmailCard from "../components/EmailCard";
import CalendarPanel from "../components/CalendarPanel";
import AskAssistant from "../components/AskAssistant";
import PriorityBadge from "../components/PriorityBadge";

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [view, setView] = useState("inbox"); // inbox | ask
  const [filterPriority, setFilterPriority] = useState("all"); // all | high | medium | low

  const loadEmails = async () => {
    try {
      const data = await apiFetch("/emails/priority");
      setEmails(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedEmail) setSelectedEmail(data[0]);
    } catch (err) {
      console.error("Load emails failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      await apiFetch("/gmail/sync", { method: "POST" });
      await loadEmails();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    syncNow();
  }, []);

  const filtered = filterPriority === "all"
    ? emails
    : emails.filter((e) => e.priority === filterPriority);

  const stats = {
    total: emails.length,
    high: emails.filter((e) => e.priority === "high").length,
    meetings: emails.filter((e) => e.hasMeeting).length,
    actions: emails.filter((e) => e.actionRequired).length,
  };

  return (
    <div className="ds">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="ds__sidebar">
        <div className="ds__brand">
          <span className="ds__brand-icon">✦</span>
          <span className="ds__brand-name">AI Secretary</span>
        </div>

        <nav className="ds__nav">
          <button
            className={`ds__nav-btn ${view === "inbox" ? "ds__nav-btn--active" : ""}`}
            onClick={() => setView("inbox")}
          >
            <span className="ds__nav-icon">📬</span>
            Priority Inbox
            {stats.high > 0 && <span className="ds__nav-badge">{stats.high}</span>}
          </button>
          <button
            className={`ds__nav-btn ${view === "ask" ? "ds__nav-btn--active" : ""}`}
            onClick={() => setView("ask")}
          >
            <span className="ds__nav-icon">🤖</span>
            Ask Assistant
          </button>
        </nav>

        {/* Stats */}
        <div className="ds__stats">
          <div className="ds__stat">
            <span className="ds__stat-val">{stats.total}</span>
            <span className="ds__stat-lbl">Emails</span>
          </div>
          <div className="ds__stat">
            <span className="ds__stat-val ds__stat-val--red">{stats.high}</span>
            <span className="ds__stat-lbl">Urgent</span>
          </div>
          <div className="ds__stat">
            <span className="ds__stat-val ds__stat-val--blue">{stats.meetings}</span>
            <span className="ds__stat-lbl">Meetings</span>
          </div>
          <div className="ds__stat">
            <span className="ds__stat-val ds__stat-val--amber">{stats.actions}</span>
            <span className="ds__stat-lbl">Actions</span>
          </div>
        </div>

        <button className={`ds__sync-btn ${syncing ? "ds__sync-btn--spinning" : ""}`} onClick={syncNow} disabled={syncing}>
          {syncing ? "⟳ Syncing…" : "⟳ Sync Gmail"}
        </button>
      </aside>

      {/* ── Main area ───────────────────────────── */}
      <main className="ds__main">
        {view === "ask" ? (
          <div className="ds__ask-wrap">
            <AskAssistant />
          </div>
        ) : (
          <>
            {/* Email list column */}
            <div className="ds__list-col">
              <div className="ds__list-header">
                <h2 className="ds__list-title">📬 Priority Inbox</h2>
                <div className="ds__filters">
                  {["all", "high", "medium", "low"].map((f) => (
                    <button
                      key={f}
                      className={`ds__filter-btn ${filterPriority === f ? "ds__filter-btn--active" : ""}`}
                      onClick={() => setFilterPriority(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ds__email-list">
                {loading ? (
                  <div className="ds__skeleton-list">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="email-skeleton" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="ds__empty">
                    <span className="ds__empty-icon">📭</span>
                    <p>No emails in this category</p>
                  </div>
                ) : (
                  filtered.map((email) => (
                    <EmailCard
                      key={email._id}
                      email={email}
                      isSelected={selectedEmail?._id === email._id}
                      onClick={() => setSelectedEmail(email)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Detail column */}
            <div className="ds__detail-col">
              {selectedEmail ? (
                <div className="email-detail">
                  <div className="email-detail__header">
                    <h2 className="email-detail__subject">{selectedEmail.subject}</h2>
                    <PriorityBadge priority={selectedEmail.priority} actionRequired={selectedEmail.actionRequired} />
                  </div>

                  <div className="email-detail__meta">
                    <span>👤 {selectedEmail.from?.replace(/<.*?>/, "").trim()}</span>
                    <span>🕐 {new Date(selectedEmail.date).toLocaleString()}</span>
                  </div>

                  {selectedEmail.priorityReason && (
                    <div className="email-detail__reason">
                      <span className="email-detail__reason-label">AI Assessment:</span>
                      {selectedEmail.priorityReason}
                    </div>
                  )}

                  {selectedEmail.hasMeeting && selectedEmail.meetingDetails && (
                    <div className="email-detail__meeting">
                      <div className="email-detail__meeting-header">🗓 Meeting Detected</div>
                      <div className="email-detail__meeting-grid">
                        {selectedEmail.meetingDetails.title && (
                          <div><span>Title</span><span>{selectedEmail.meetingDetails.title}</span></div>
                        )}
                        {selectedEmail.meetingDetails.date && (
                          <div><span>Date</span><span>{selectedEmail.meetingDetails.date}</span></div>
                        )}
                        {selectedEmail.meetingDetails.time && (
                          <div><span>Time</span><span>{selectedEmail.meetingDetails.time}</span></div>
                        )}
                        {selectedEmail.meetingDetails.duration && (
                          <div><span>Duration</span><span>{selectedEmail.meetingDetails.duration}</span></div>
                        )}
                        {selectedEmail.meetingDetails.location && (
                          <div><span>Location</span><span>{selectedEmail.meetingDetails.location}</span></div>
                        )}
                        {selectedEmail.meetingDetails.attendees?.length > 0 && (
                          <div><span>Attendees</span><span>{selectedEmail.meetingDetails.attendees.join(", ")}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="email-detail__section">
                    <h3 className="email-detail__section-title">✨ AI Summary</h3>
                    <p className="email-detail__summary">{selectedEmail.summary || "No summary yet."}</p>
                  </div>

                  <div className="email-detail__section">
                    <h3 className="email-detail__section-title">📄 Email Body</h3>
                    <p className="email-detail__body">{selectedEmail.body || "No content."}</p>
                  </div>
                </div>
              ) : (
                <div className="ds__no-selection">
                  <span className="ds__no-selection-icon">✦</span>
                  <p>Select an email to read</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Calendar panel ──────────────────────── */}
      <div className="ds__cal">
        <CalendarPanel />
      </div>
    </div>
  );
}
