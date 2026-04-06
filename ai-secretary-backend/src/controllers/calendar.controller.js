import { getUpcomingEvents, createCalendarEvent } from "../services/calendar.service.js";
import Email from "../models/Email.js";

// GET /api/calendar/events — upcoming events for the next 7 days
export const getEvents = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const events = await getUpcomingEvents(req.user.id, days);
    res.json(events);
  } catch (err) {
    console.error("❌ Calendar fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch calendar events", details: err.message });
  }
};

// POST /api/calendar/create-from-email — user confirms, then we add to calendar
export const createEventFromEmail = async (req, res) => {
  try {
    const { emailId } = req.body;

    const email = await Email.findOne({ _id: emailId, user: req.user.id });
    if (!email) return res.status(404).json({ error: "Email not found" });
    if (!email.hasMeeting) return res.status(400).json({ error: "No meeting detected in this email" });
    if (email.calendarEventAdded) return res.status(400).json({ error: "Event already added to calendar" });

    const calEvent = await createCalendarEvent(req.user.id, email.meetingDetails);

    email.calendarEventId = calEvent.id;
    email.calendarEventAdded = true;
    await email.save();

    res.json({ success: true, eventId: calEvent.id, eventLink: calEvent.htmlLink });
  } catch (err) {
    console.error("❌ Calendar event creation failed:", err);
    res.status(500).json({ error: "Failed to create calendar event", details: err.message });
  }
};
