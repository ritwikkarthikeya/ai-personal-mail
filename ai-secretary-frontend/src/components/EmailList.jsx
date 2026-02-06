import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function EmailList() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmails = async () => {
      try {
        const data = await apiFetch("/emails");
        setEmails(data || []);
      } catch (err) {
        console.error("getEmails error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEmails();
  }, []);

  if (loading) return <p>Loading emails...</p>;
  if (!emails.length) return <p>No emails found.</p>;

  return (
    <div>
      {emails.map((email) => (
  <div key={email._id} className="email-card">
    <h3>{email.subject}</h3>
    <p>
      <strong>From:</strong> {email.from}
    </p>
  </div>
))}
    </div>
  );
}
