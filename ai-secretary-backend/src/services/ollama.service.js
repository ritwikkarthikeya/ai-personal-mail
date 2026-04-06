import axios from "axios";

const OLLAMA_BASE = process.env.OLLAMA_BASE || "http://localhost:11434";

// ─── Helper: call Ollama and return raw text ───────────────────────────────
const callOllama = async (prompt) => {
  let fullResponse = "";

  const res = await axios.post(
    `${OLLAMA_BASE}/api/generate`,
    { model: "mistral", prompt, stream: false },
    { timeout: 60000 }
  );

  // Ollama can return either a single object or newline-delimited JSON
  const raw = res.data;
  if (typeof raw === "string") {
    raw.split("\n").forEach((line) => {
      try {
        const obj = JSON.parse(line);
        if (obj.response) fullResponse += obj.response;
      } catch {}
    });
  } else if (raw.response) {
    fullResponse = raw.response;
  }

  return fullResponse.trim();
};

// ─── 1. Summarise email ────────────────────────────────────────────────────
export const summarizeMail = async (text) => {
  const prompt = `Summarize this email in 2-3 concise sentences. Be direct and factual. Do not include greetings or sign-offs.\n\nEmail:\n${text}`;
  return callOllama(prompt);
};

// ─── 2. Extract meeting info ───────────────────────────────────────────────
export const extractMeetingInfo = async (text) => {
  const prompt = `Analyze this email and extract any meeting or event information.
Reply with ONLY a valid JSON object (no markdown, no explanation):
{
  "hasMeeting": true or false,
  "title": "meeting title or empty string",
  "date": "YYYY-MM-DD or empty string",
  "time": "HH:MM in 24h format or empty string",
  "duration": "e.g. 1 hour or empty string",
  "location": "physical location or video link or empty string",
  "attendees": ["name or email", ...]
}

Email:
${text}`;

  try {
    const raw = await callOllama(prompt);
    // Strip any markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      hasMeeting: Boolean(parsed.hasMeeting),
      title: parsed.title || "",
      date: parsed.date || "",
      time: parsed.time || "",
      duration: parsed.duration || "",
      location: parsed.location || "",
      attendees: Array.isArray(parsed.attendees) ? parsed.attendees : [],
    };
  } catch {
    return { hasMeeting: false };
  }
};

// ─── 3. Prioritise email ───────────────────────────────────────────────────
export const prioritizeEmail = async (subject, from, body) => {
  const prompt = `You are an AI email assistant helping a student manage their inbox. Classify this email's priority.
Reply with ONLY a valid JSON object (no markdown, no explanation):
{
  "priority": "high" or "medium" or "low",
  "reason": "one short sentence explaining why",
  "actionRequired": true or false
}

Priority rules for a student:
- high: job application updates (interview calls, next steps, assessments, offers, rejections), coding contest announcements or results, urgent OTPs/verification codes, account security alerts, hackathon invites, internship offers, deadline reminders
- medium: general job alerts and postings (not a specific application update), university or college updates, newsletters with career tips, general professional emails needing a reply
- low: promotional marketing emails, newsletters with no action needed, generic job board digests, social media notifications, automated platform updates, newsletters/digests

From: ${from}
Subject: ${subject}
Body snippet: ${body.slice(0, 800)}`;

  try {
    const raw = await callOllama(prompt);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      priority: ["high", "medium", "low"].includes(parsed.priority)
        ? parsed.priority
        : "medium",
      reason: parsed.reason || "",
      actionRequired: Boolean(parsed.actionRequired),
    };
  } catch {
    return { priority: "medium", reason: "", actionRequired: false };
  }
};
