import { useEffect, useState } from "react";
import { fetchEmails } from "../api/emails";

export default function EmailList() {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    fetchEmails().then(setEmails);
  }, []);

  return (
    <section>
      <h3>All Emails</h3>
      {emails.map((e) => (
        <div key={e.id} className="card">
          <b>{e.subject}</b>
          <p>{e.summary}</p>
          <small>{e.importance}</small>
        </div>
      ))}
    </section>
  );
}
