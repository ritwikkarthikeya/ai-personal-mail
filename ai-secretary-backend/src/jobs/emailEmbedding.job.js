import { pool } from "../config/db.js";
import { embeddingService } from "../services/embedding.service.js";

export const generateEmailEmbeddings = async () => {
  console.log("🔹 Starting email embedding job");

  const { rows: emails } = await pool.query(`
    SELECT id, user_id, summary
    FROM emails
    WHERE summary IS NOT NULL
      AND id NOT IN (SELECT email_id FROM embeddings)
    LIMIT 20
  `);

  for (const email of emails) {
    try {
      const embedding = await embeddingService.embed(email.summary);

      if (!embedding) {
        console.warn(`⚠️ Skipping email ${email.id}`);
        continue;
      }

        const vectorLiteral = `[${embedding.join(",")}]`;

        await pool.query(
          `
          INSERT INTO embeddings (user_id, email_id, embedding)
          VALUES ($1, $2, $3::vector(768))
          `,
          [email.user_id, email.id, vectorLiteral]
        );
        
        console.log("✅ Embedded email", email.id);
    } catch (err) {
      console.error("❌ Failed to embed email", email.id, err.message);
    }
  }

  console.log("✅ Email embedding job finished");
};
