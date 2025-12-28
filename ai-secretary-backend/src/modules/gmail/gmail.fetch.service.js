import { google } from "googleapis";
import { googleClient } from "../../config/google.js";
import { pool } from "../../config/db.js";

const gmail = google.gmail({ version: "v1", auth: googleClient });

async function loadUserCredentials(userId) {
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

  googleClient.setCredentials({
    refresh_token: rows[0].google_refresh_token,
  });
}

export async function fetchNextEmails({ userId, maxResults, pageToken }) {
  await loadUserCredentials(userId);

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

export async function fetchEmailById(userId, messageId) {
  await loadUserCredentials(userId);

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  return res.data;
}
