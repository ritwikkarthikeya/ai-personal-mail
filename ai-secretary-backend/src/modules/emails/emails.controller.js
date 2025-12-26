import { pool } from "../../config/db.js";

export const getEmails = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT id, from_email, subject, summary, importance, received_at
      FROM emails
      WHERE user_id = $1
        AND is_duplicate = FALSE
      ORDER BY received_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getEmails error:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

export const getSummarizedEmails = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT id, subject, summary, importance
      FROM emails
      WHERE user_id = $1
        AND summary IS NOT NULL
        AND is_duplicate = FALSE
      ORDER BY received_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getSummarizedEmails error:", err);
    res.status(500).json({ error: "Failed to fetch summarized emails" });
  }
};
