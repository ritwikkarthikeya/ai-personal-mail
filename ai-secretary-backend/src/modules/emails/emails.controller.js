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
