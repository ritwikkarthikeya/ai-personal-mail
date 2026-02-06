import Email from "../models/Email.js";
import { fetchEmails, getEmailDetails } from "../services/gmail.service.js";
import { summarizeMail } from "../services/ollama.service.js";
import { generateEmbedding } from "../services/embedding.service.js";

export const syncEmails = async (req, res) => {
  try {
    console.log("SYNC user:", req.user.id);

    const msgs = await fetchEmails(req.user.id);

    console.log("Fetched messages:", msgs.length);

    for (let m of msgs) {
      const exists = await Email.findOne({
        gmailId: m.id,
        user: req.user.id,
      });

      if (exists) continue;

      const details = await getEmailDetails(req.user.id, m.id);

      const body = details.snippet || "";
      const getHeader = (headers, name) =>
      headers.find((h) => h.name === name)?.value || "";

      const summary = await summarizeMail(body);
      const embedding = await generateEmbedding(body);

      const headers = details.payload.headers;

const subject = getHeader(headers, "Subject") || "(No Subject)";
const from = getHeader(headers, "From") || "Unknown sender";
const dateHeader = getHeader(headers, "Date");

await Email.create({
  user: req.user.id,
  gmailId: m.id,
  subject,
  from,
  body,
  summary,
  embedding,
  date: dateHeader ? new Date(dateHeader) : new Date(),
});
    }

    res.json({ synced: true });
  } catch (err) {
    console.error("❌ Gmail sync failed:", err);
    res.status(500).json({
      error: "Gmail sync failed",
      details: err.message,
    });
  }
};
