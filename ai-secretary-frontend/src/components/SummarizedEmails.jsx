import { useEffect, useState } from "react";
import { fetchSummarizedEmails } from "../api/emails";

export default function SummarizedEmails() {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    fetchSummarizedEmails().then(setEmails);
  }, []);

  return (
    <section>
      <h3>Summarized Emails</h3>
      {emails.map((e) => (
        <div key={e.id} className="card">
          <b>{e.subject}</b>
          <p>{e.summary}</p>
        </div>
      ))}
    </section>
  );
}
