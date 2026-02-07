import { google } from "googleapis";
import { createOAuthClient } from "../config/google.js";
import User from "../models/User.js";

export const getGmailClientForUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
};

// ------------------------------------

export const fetchNewMessages = async (userId) => {
  const gmail = await getGmailClientForUser(userId);
  const user = await User.findById(userId);

  // First time → normal inbox fetch
  if (!user.historyId) {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
    });

    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    user.historyId = profile.data.historyId;
    await user.save();

    return res.data.messages || [];
  }

  // Incremental history API
  const historyRes = await gmail.users.history.list({
    userId: "me",
    startHistoryId: user.historyId,
  });

  const history = historyRes.data.history || [];

  const messageIds = new Set();

  history.forEach((h) => {
    h.messagesAdded?.forEach((m) => {
      messageIds.add(m.message.id);
    });
  });

  // update checkpoint
  const profile = await gmail.users.getProfile({
    userId: "me",
  });

  user.historyId = profile.data.historyId;
  await user.save();

  return [...messageIds].map((id) => ({ id }));
};

// ------------------------------------

export const getEmailDetails = async (userId, id) => {
  const gmail = await getGmailClientForUser(userId);

  const msg = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });

  return msg.data;
};
