import { google } from "googleapis";
import { pool } from "../../config/db.js";

export async function loadUserCredentials(userId) {
  const { rows } = await pool.query(
    `
    SELECT google_refresh_token
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (!rows.length || !rows[0].google_refresh_token) {
    throw new Error("Missing refresh token");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: rows[0].google_refresh_token,
  });
if (!rows.length || !rows[0].google_refresh_token) {
  console.error("❌ No refresh token in DB for user:", userId);
  throw new Error("Missing refresh token");
}
  return oauth2Client;
}

/* ✅ FETCH EMAIL IDS */
export async function fetchNextEmails({ userId, maxResults, pageToken }) {
  const auth = await loadUserCredentials(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    pageToken,
  });

  return {
    messages: res.data.messages || [],
    nextPageToken: res.data.nextPageToken,
  };
}

/* ✅ FETCH FULL EMAIL */
export async function fetchEmailById(userId, messageId) {
  const auth = await loadUserCredentials(userId);
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  return res.data;
}
