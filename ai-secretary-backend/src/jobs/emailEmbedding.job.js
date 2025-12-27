import { pool } from "../config/db.js";
import { embeddingService } from "../services/embedding.service.js";

export const generateEmailEmbeddings = async (userId) => {
  console.log("🔹 Starting embedding job for user:", userId);

  const { rows: emails } = await pool.query(
    `
    SELECT id, summary
    FROM emails
    WHERE user_id = $1
      AND summary IS NOT NULL
      AND id NOT IN (SELECT email_id FROM embeddings)
    LIMIT 20
    `,
    [userId]
  );

  for (const email of emails) {
    try {
      const embedding = await embeddingService.embed(email.summary);

      if (!embedding?.length) continue;

      await pool.query(
        `
        INSERT INTO embeddings (user_id, email_id, embedding)
        VALUES ($1, $2, $3)
        `,
        [userId, email.id, embedding]
      );

      console.log("✅ Embedded email", email.id);
    } catch (err) {
      console.error("❌ Embedding failed:", email.id, err.message);
    }
  }

  console.log("✅ Embedding job finished");
};
