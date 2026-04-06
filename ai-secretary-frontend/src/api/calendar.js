import { apiFetch } from "../utils/api";

export const getCalendarEvents = (days = 7) =>
  apiFetch(`/calendar/events?days=${days}`);

export const addEmailToCalendar = (emailId) =>
  apiFetch("/calendar/create-from-email", {
    method: "POST",
    body: JSON.stringify({ emailId }),
  });
