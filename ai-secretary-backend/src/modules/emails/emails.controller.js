import { pool } from "../../config/db.js";

export const getEmails = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { rows } = await pool.query(
    `
    SELECT id, subject, from_email, created_at, ai_processed
    FROM emails
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  res.json(rows); // ⚠️ return ARRAY, not { rows }
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
