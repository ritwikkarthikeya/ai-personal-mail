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

// ----------------------------

export const fetchEmails = async (userId) => {
  const gmail = await getGmailClientForUser(userId);

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: 5,
  });

  return list.data.messages || [];
};

// ----------------------------

export const getEmailDetails = async (userId, id) => {
  const gmail = await getGmailClientForUser(userId);

  const msg = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });

  return msg.data;
};
