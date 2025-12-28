import { pool } from "../../config/db.js";

// GET /api/emails
export const getEmails = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { rows } = await pool.query(
      `
      SELECT id, subject, from_email, received_at
      FROM emails
      WHERE user_id = $1
      ORDER BY received_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("getEmails error:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

// GET /api/emails/summaries
export const getSummarizedEmails = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { rows } = await pool.query(
      `
      SELECT id, subject, summary, importance
      FROM emails
      WHERE user_id = $1
        AND summary IS NOT NULL
      ORDER BY received_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("getSummarizedEmails error:", err);
    res.status(500).json({ error: "Failed to fetch summaries" });
  }
};
