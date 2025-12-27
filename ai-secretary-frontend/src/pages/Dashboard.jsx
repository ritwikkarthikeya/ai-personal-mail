import { useState } from "react";
import EmailList from "../components/EmailList";
import SummarizedEmails from "../components/SummarizedEmails";
import AskAssistant from "../components/AskAssistant";

export default function Dashboard() {
  const [mode, setMode] = useState("ask"); // ask | emails | summary

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">AI Secretary</h1>

        <div className="dashboard-tabs">
          <button
            className={mode === "ask" ? "tab active" : "tab"}
            onClick={() => setMode("ask")}
          >
            🤖 Ask
          </button>
          <button
            className={mode === "emails" ? "tab active" : "tab"}
            onClick={() => setMode("emails")}
          >
            📧 Emails
          </button>
          <button
            className={mode === "summary" ? "tab active" : "tab"}
            onClick={() => setMode("summary")}
          >
            📝 Summaries
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {mode === "ask" && <AskAssistant />}
        {mode === "emails" && <EmailList />}
        {mode === "summary" && <SummarizedEmails />}
      </div>
    </div>
  );
}
