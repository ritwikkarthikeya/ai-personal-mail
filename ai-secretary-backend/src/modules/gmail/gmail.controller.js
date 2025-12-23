import { pool } from "../../config/db.js";
import { syncEmailsForUser } from "./gmail.sync.js";

export const syncMyEmails = async (req, res) => {
  const { userId } = req.query;

  const { rows } = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [userId]
  );

  if (!rows.length) {
    return res.status(404).json({ error: "User not found" });
  }

  await syncEmailsForUser(rows[0]);

  res.json({ message: "Emails synced successfully" });
};
