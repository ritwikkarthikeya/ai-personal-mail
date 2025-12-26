import { pool } from "../../config/db.js";
import { embeddingService } from "../../services/embedding.service.js";
import fetch from "node-fetch";

export const ragSearch = async (userId, query) => {
  // 1️⃣ Generate query embedding
  const queryEmbedding = await embeddingService.embed(query);

  // 🔒 SAFETY CHECK
  if (!queryEmbedding || queryEmbedding.length !== 768) {
    console.warn("⚠️ Invalid query embedding, skipping vector search");
    return fallbackLLMAnswer(query);
  }

  // ✅ Convert to pgvector literal
  const queryVector = `[${queryEmbedding.join(",")}]`;

  // 2️⃣ Check if embeddings exist for user
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM embeddings WHERE user_id = $1`,
    [userId]
  );

  if (Number(countResult.rows[0].count) === 0) {
    console.warn("⚠️ No email embeddings found, using fallback");
    return fallbackLLMAnswer(query);
  }

  // 3️⃣ Vector search (CORRECT)
  const { rows } = await pool.query(
    `
    SELECT e.summary, e.subject, e.from_email
    FROM embeddings emb
    JOIN emails e ON e.id = emb.email_id
    WHERE emb.user_id = $1
      AND e.is_duplicate = FALSE
    ORDER BY emb.embedding <-> $2::vector(768)
    LIMIT 5
    `,
    [userId, queryVector]
  );

  if (rows.length === 0) {
    return fallbackLLMAnswer(query);
  }

  // 4️⃣ Build context
  const context = rows
    .map(
      (r, i) => `
EMAIL ${i + 1}
From: ${r.from_email || "Unknown"}
Subject: ${r.subject || "No subject"}
Summary: ${r.summary || "No summary"}
`
    )
    .join("\n");

  // 5️⃣ Ask LLM with RAG context
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt: `
You are an AI email assistant.

Using ONLY the information explicitly provided below,
answer the user's question.

Do NOT invent emails.
Do NOT merge emails.
Do NOT guess missing data.

Emails:
${context}

User question:
${query}
`,
      stream: false,
      options: { temperature: 0 },
    }),
  });

  const data = await response.json();
  return data.response;
};

/**
 * 🔁 FALLBACK WHEN RAG CANNOT RUN
 */
async function fallbackLLMAnswer(query) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt: `
You are an AI assistant.

Answer the user's question based on general understanding.
If the question refers to emails, explain that more emails
need to be processed for deeper insights.

User question:
${query}
`,
      stream: false,
      options: { temperature: 0 },
    }),
  });

  const data = await response.json();
  return data.response;
}
