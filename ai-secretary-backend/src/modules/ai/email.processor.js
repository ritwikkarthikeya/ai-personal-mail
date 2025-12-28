import { pool } from "../../config/db.js";
import { aiService } from "../../services/ai.service.js";
import { embeddingService } from "../../services/embedding.service.js";

export const processUnprocessedEmails = async (userId) => {
  if (!userId) {
    console.warn("⚠️ processUnprocessedEmails called without userId");
    return;
  }
if (process.env.DISABLE_AI === "true") {
  console.log("⏸️ AI disabled");
  return;
}

  console.log("⏰ Running AI email processor for user:", userId);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: emails } = await client.query(
      `
      SELECT *
      FROM emails
      WHERE ai_processed = FALSE
        AND user_id = $1
      ORDER BY received_at ASC
      LIMIT 5
      FOR UPDATE SKIP LOCKED
      `,
      [userId]
    );

    for (const email of emails) {
      try {
        console.log("🔹 Processing:", email.subject);

        const analysis = await aiService.analyzeEmail(
          `From: ${email.from_email}
Subject: ${email.subject}

${email.body || ""}`
        );
await client.query(
  `
  INSERT INTO failed_emails (email_id, user_id, stage, error)
  VALUES ($1, $2, 'AI_PROCESSING', $3)
  `,
  [email.id, userId, err.message]
);

        await client.query(
          `
          UPDATE emails
          SET summary = $1,
              importance = $2,
              ai_processed = TRUE
          WHERE id = $3
          `,
          [analysis.summary, analysis.importance || "medium", email.id]
        );

        const embedding = await embeddingService.embed(
          `${analysis.summary}\n${email.subject}`
        );

        await client.query(
          `
          INSERT INTO embeddings (user_id, email_id, embedding)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
          `,
          [userId, email.id, embedding]
        );

        console.log("✅ AI processed:", email.subject);
      } catch (err) {
        console.error("❌ Failed email:", email.id, err.message);

        await client.query(
          `
          UPDATE emails
          SET last_error = $1,
              retry_count = retry_count + 1
          WHERE id = $2
          `,
          [err.message, email.id]
        );
      }
    }
    
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ AI batch failed:", err.message);
  } finally {
    client.release();
  }
};
