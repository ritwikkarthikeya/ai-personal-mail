import Email from "../models/Email.js";

export const getEmails = async (req, res) => {
  const emails = await Email.find({ user: req.user.id })
    .sort({ date: -1 });

  res.json(emails);
};

export const getSummaries = async (req, res) => {
  const emails = await Email.find(
    { user: req.user.id },
    { subject: 1, summary: 1 }
  ).sort({ date: -1 });

  res.json(emails);
};
