import { pool } from "../../config/db.js";
import { aiService } from "../../services/ai.service.js";

export const processUnprocessedEmails = async () => {
  const { rows: emails } = await pool.query(`
    SELECT e.*, u.id as user_id
    FROM emails e
    JOIN users u ON e.user_id = u.id
    WHERE ai_processed = FALSE
    LIMIT 5
  `);

  for (const email of emails) {
    try {
      const analysis = await aiService.analyzeEmail(
        `From: ${email.from_email}
Subject: ${email.subject}

${email.body}`
      );

      await pool.query(
        `
        UPDATE emails
        SET summary = $1,
            importance = $2,
            ai_processed = TRUE
        WHERE id = $3
        `,
        [
          analysis.summary,
          analysis.importance || "medium",
          email.id,
        ]
      );

      if (Array.isArray(analysis.tasks)) {
  for (const task of analysis.tasks) {
    if (!task?.title) continue;

    await pool.query(
      `
      INSERT INTO tasks (user_id, email_id, title, due_date)
      VALUES ($1, $2, $3, $4)
      `,
      [
        email.user_id,
        email.id,
        task.title,
        task.due_date || null,
      ]
    );
  }
}

    } catch (err) {
      console.error("AI processing failed for email:", email.id, err.message);
    }
  }
};
