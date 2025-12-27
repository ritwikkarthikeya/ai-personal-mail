import { google } from "googleapis";
import { googleClient } from "../../config/google.js";

const gmail = google.gmail({ version: "v1", auth: googleClient });

export async function fetchNextEmails({ maxResults = 5, pageToken }) {
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    pageToken,
  });

  return {
    messages: res.data.messages || [],
    nextPageToken: res.data.nextPageToken || null,
  };
}

export async function fetchEmailById(messageId) {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  return res.data;
}
