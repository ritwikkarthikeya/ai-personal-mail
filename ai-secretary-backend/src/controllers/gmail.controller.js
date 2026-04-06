import Email from "../models/Email.js";
import { getEmailDetails } from "../services/gmail.service.js";
import { summarizeMail, extractMeetingInfo, prioritizeEmail } from "../services/ollama.service.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { fetchNewMessages } from "../services/gmail.service.js";

export const syncEmails = async (req, res) => {
  try {
    console.log("SYNC user:", req.user.id);

    const msgs = await fetchNewMessages(req.user.id);
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

      const headers = details.payload.headers;
      const subject = getHeader(headers, "Subject") || "(No Subject)";
      const from = getHeader(headers, "From") || "Unknown sender";
      const dateHeader = getHeader(headers, "Date");

      // ── Run AI analysis in parallel for speed ──
      const [summary, meetingInfo, priorityInfo, embedding] = await Promise.allSettled([
        summarizeMail(body),
        extractMeetingInfo(body),
        prioritizeEmail(subject, from, body),
        generateEmbedding(body),
      ]);

      const resolvedSummary = summary.status === "fulfilled" ? summary.value : "";
      const resolvedMeeting = meetingInfo.status === "fulfilled" ? meetingInfo.value : { hasMeeting: false };
      const resolvedPriority = priorityInfo.status === "fulfilled" ? priorityInfo.value : { priority: "medium", actionRequired: false, reason: "" };
      const resolvedEmbedding = embedding.status === "fulfilled" ? embedding.value : [];

      await Email.create({
        user: req.user.id,
        gmailId: m.id,
        subject,
        from,
        body,
        date: dateHeader ? new Date(dateHeader) : new Date(),

        // Summary
        summary: resolvedSummary,
        embedding: resolvedEmbedding,

        // Priority
        priority: resolvedPriority.priority,
        actionRequired: resolvedPriority.actionRequired,
        priorityReason: resolvedPriority.reason,

        // Meeting
        hasMeeting: resolvedMeeting.hasMeeting,
        meetingDetails: resolvedMeeting.hasMeeting
          ? {
              title: resolvedMeeting.title,
              date: resolvedMeeting.date,
              time: resolvedMeeting.time,
              duration: resolvedMeeting.duration,
              location: resolvedMeeting.location,
              attendees: resolvedMeeting.attendees,
            }
          : undefined,
        calendarEventAdded: false,
      });

      console.log(
        `✅ Saved: "${subject}" | priority=${resolvedPriority.priority} | meeting=${resolvedMeeting.hasMeeting}`
      );
    }

    res.json({ synced: true, count: msgs.length });
  } catch (err) {
    console.error("❌ Gmail sync failed:", err);
    res.status(500).json({
      error: "Gmail sync failed",
      details: err.message,
    });
  }
};
