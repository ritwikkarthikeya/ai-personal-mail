import { google } from "googleapis";
import { googleClient } from "../config/google.js";

export const gmailService = {
  async getClient(refreshToken) {
    googleClient.setCredentials({
      refresh_token: refreshToken,
    });

    return google.gmail({ version: "v1", auth: googleClient });
  },

  async listMessages(gmail) {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10, // keep small for now
    });

    return res.data.messages || [];
  },

  async getMessage(gmail, messageId) {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    return res.data;
  },
};
