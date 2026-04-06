import { google } from "googleapis";
import { createOAuthClient } from "../config/google.js";
import User from "../models/User.js";

// ─── Build an authenticated Calendar client for a user ─────────────────────
export const getCalendarClientForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
};

// ─── Create a Calendar event from extracted meeting info ───────────────────
export const createCalendarEvent = async (userId, meetingDetails) => {
  const calendar = await getCalendarClientForUser(userId);

  const { title, date, time, duration, location, attendees } = meetingDetails;

  // Build start datetime — fall back to today if date is missing
  const startDate = date || new Date().toISOString().split("T")[0];
  const startTime = time || "09:00";
  const startDateTime = new Date(`${startDate}T${startTime}:00`);

  // Parse duration to get end time (default 1 hour)
  let durationMinutes = 60;
  if (duration) {
    const hourMatch = duration.match(/(\d+)\s*hour/i);
    const minMatch = duration.match(/(\d+)\s*min/i);
    durationMinutes =
      (hourMatch ? parseInt(hourMatch[1]) * 60 : 0) +
      (minMatch ? parseInt(minMatch[1]) : 0) || 60;
  }

  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

  const event = {
    summary: title || "Meeting (from email)",
    location: location || "",
    description: "Automatically created by AI Secretary from email",
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "Asia/Kolkata",
    },
  };

  // Add attendees if available
  if (attendees && attendees.length > 0) {
    event.attendees = attendees
      .filter((a) => a.includes("@"))
      .map((email) => ({ email }));
  }

  const res = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  return res.data;
};

// ─── Get upcoming events (next N days) ────────────────────────────────────
export const getUpcomingEvents = async (userId, days = 7) => {
  const calendar = await getCalendarClientForUser(userId);

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 20,
  });

  return (res.data.items || []).map((event) => ({
    id: event.id,
    title: event.summary || "Untitled",
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    location: event.location || "",
    description: event.description || "",
    isAllDay: !event.start?.dateTime,
    fromEmail: event.description?.includes("AI Secretary") || false,
  }));
};
