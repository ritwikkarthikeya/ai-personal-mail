import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function SummarizedEmails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        const data = await apiFetch("/emails/summaries");
        setEmails(data || []);
      } catch (err) {
        console.error("getSummarizedEmails error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSummaries();
  }, []);

  if (loading) return <p>Loading summaries...</p>;
  if (!emails.length) return <p>No summaries yet.</p>;

  return (
    <div>
      {emails.map((email) => (
        <div key={email.id} className="summary-card">
          <h3>{email.subject}</h3>
          <p>{email.summary}</p>
        </div>
      ))}
    </div>
  );
}
