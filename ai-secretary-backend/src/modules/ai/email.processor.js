import { pool } from "../../config/db.js";
import { aiService } from "../../services/ai.service.js";
import { embeddingService } from "../../services/embedding.service.js";

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
      console.log("🔹 Processing:", email.subject);

      // 1️⃣ Run AI analysis
      const analysis = await aiService.analyzeEmail(
        `From: ${email.from_email}
Subject: ${email.subject}

${email.body || ""}`
      );

      // 2️⃣ Update email with AI results
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

      // 3️⃣ Insert tasks (if any)
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

      // 4️⃣ Create & store embedding (RAG)
      const embedding = await embeddingService.embed(
        `${analysis.summary}\n${email.subject}`
      );

      await pool.query(
        `
        INSERT INTO embeddings (user_id, email_id, embedding)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
        `,
        [email.user_id, email.id, embedding]
      );

      console.log("✅ AI processed:", email.subject);
    } catch (err) {
      console.error(
        "❌ AI processing failed for email:",
        email.id,
        err.message
      );
    }
  }
};
