import { google } from "googleapis";
import { createOAuthClient } from "../config/google.js";
import User from "../models/User.js";

export const getGmailClientForUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  if (!user.refreshToken) {
    throw new Error("Gmail not connected. No refresh token.");
  }

  const oauth2Client = createOAuthClient();

  // 🔥 ONLY refresh token
  oauth2Client.setCredentials({
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
      maxResults: 20,
    });

    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    user.historyId = profile.data.historyId;
    await user.save();

    return res.data.messages || [];
  }

  // Incremental history API — historyId can go stale after ~30 days (404)
  try {
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

    // Update checkpoint
    const profile = await gmail.users.getProfile({ userId: "me" });
    user.historyId = profile.data.historyId;
    await user.save();

    return [...messageIds].map((id) => ({ id }));
  } catch (histErr) {
    // historyId is stale or invalid — reset and do a full fresh fetch
    if (histErr.status === 404 || histErr.code === 404 || histErr.response?.status === 404) {
      console.warn("⚠️  historyId stale (404) — resetting and doing full fetch");
      user.historyId = null;
      await user.save();

      const res = await gmail.users.messages.list({ userId: "me", maxResults: 50 });
      const profile = await gmail.users.getProfile({ userId: "me" });
      user.historyId = profile.data.historyId;
      await user.save();

      return res.data.messages || [];
    }
    throw histErr;
  }
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
