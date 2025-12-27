import { pool } from "../../config/db.js";
import { embeddingService } from "../../services/embedding.service.js";
import fetch from "node-fetch";

export const ragSearch = async (userId, query) => {
  // 1️⃣ Generate query embedding
  const queryEmbedding = await embeddingService.embed(query);

  if (!queryEmbedding || queryEmbedding.length !== 768) {
    return strictFallback(query);
  }

  const queryVector = `[${queryEmbedding.join(",")}]`;

  // 2️⃣ Ensure embeddings exist
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM embeddings WHERE user_id = $1`,
    [userId]
  );

  if (Number(countRows[0].count) === 0) {
    return strictFallback(query);
  }

  // 3️⃣ Vector search
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
    return strictFallback(query);
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

  // 5️⃣ STRICT RAG PROMPT
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral",
      prompt: `
You are an AI email assistant.

RULES:
- Use ONLY the emails below.
- If the answer is NOT present, respond exactly:
  "Not found in the retrieved emails."
- Do NOT infer, guess, or generalize.
- Do NOT mention emails outside this list.

Emails:
${context}

Question:
${query}
`,
      stream: false,
      options: { temperature: 0 },
    }),
  });

  const data = await response.json();
  return data.response;
};

async function strictFallback(query) {
  return `Not enough processed emails to answer this question reliably.`;
}
