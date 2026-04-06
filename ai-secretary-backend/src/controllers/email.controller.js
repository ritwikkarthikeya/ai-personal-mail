import Email from "../models/Email.js";

export const getEmails = async (req, res) => {
  const emails = await Email.find({ user: req.user.id }).sort({ date: -1 });
  res.json(emails);
};

export const getSummaries = async (req, res) => {
  const emails = await Email.find(
    { user: req.user.id },
    { subject: 1, summary: 1, from: 1, date: 1, priority: 1, actionRequired: 1, hasMeeting: 1, calendarEventAdded: 1 }
  ).sort({ date: -1 });
  res.json(emails);
};

// GET /api/emails/priority — emails sorted by priority (high → medium → low)
export const getPriorityEmails = async (req, res) => {
  const priorityOrder = { high: 1, medium: 2, low: 3 };

  const emails = await Email.find(
    { user: req.user.id },
    {
      subject: 1,
      from: 1,
      date: 1,
      summary: 1,
      priority: 1,
      actionRequired: 1,
      priorityReason: 1,
      hasMeeting: 1,
      meetingDetails: 1,
      calendarEventAdded: 1,
      calendarEventId: 1,
    }
  ).sort({ date: -1 });

  // Sort by priority then date
  emails.sort((a, b) => {
    const pa = priorityOrder[a.priority] || 2;
    const pb = priorityOrder[b.priority] || 2;
    return pa !== pb ? pa - pb : new Date(b.date) - new Date(a.date);
  });

  res.json(emails);
};
