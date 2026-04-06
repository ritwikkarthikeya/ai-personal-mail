import Email from "../models/Email.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { cosineSimilarity } from "../utils/cosine.js";
import axios from "axios";
export const semanticSearch = async (req, res) => {
  const queryEmbedding = await generateEmbedding(req.body.query);

  const emails = await Email.find({ user: req.user.id });

  const scored = emails.map((e) => ({
    ...e.toObject(),
    score: cosineSimilarity(queryEmbedding, e.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);

  res.json(scored.slice(0, 10));
};

export const askAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ error: "Question is required" });

    let topEmails = [];

    // Try semantic search first
    const queryEmbedding = await generateEmbedding(question);
    const hasEmbeddings = Array.isArray(queryEmbedding) && queryEmbedding.length > 0;

    if (hasEmbeddings) {
      const emails = await Email.find({
        user: req.user.id,
        embedding: { $exists: true, $ne: [] },
      });

      const scored = emails
        .map((e) => ({
          email: e,
          score: Array.isArray(e.embedding) && e.embedding.length > 0
            ? cosineSimilarity(queryEmbedding, e.embedding)
            : 0,
        }))
        .sort((a, b) => b.score - a.score);

      topEmails = scored.slice(0, 5).map((s) => s.email);
    }

    // Fallback: keyword search if no embeddings
    if (topEmails.length === 0) {
      console.log("⚠️  No embeddings — falling back to keyword search");
      topEmails = await Email.find({
        user: req.user.id,
        $or: [
          { subject: { $regex: question, $options: "i" } },
          { body:    { $regex: question, $options: "i" } },
          { from:    { $regex: question, $options: "i" } },
          { summary: { $regex: question, $options: "i" } },
        ],
      }).limit(5);

      // Final fallback: just grab recent emails
      if (topEmails.length === 0) {
        topEmails = await Email.find({ user: req.user.id })
          .sort({ date: -1 })
          .limit(5);
      }
    }

    const context = topEmails
      .map((e) => `Subject: ${e.subject}\nFrom: ${e.from}\nSummary: ${e.summary || ""}\nBody: ${e.body || ""}`)
      .join("\n---\n");

    console.log("ASK CONTEXT (first 500):\n", context.slice(0, 500));

    const ollamaRes = await axios.post(
      `${process.env.OLLAMA_BASE}/api/generate`,
      {
        model: "mistral",
        prompt: `You are a helpful email assistant. Answer the user's question based on their emails below.
Be concise, direct, and mention email subjects when relevant.

Emails:
${context}

Question: ${question}

Answer:`,
        stream: false,
      },
      { timeout: 60000 }
    );

    const answer =
      ollamaRes.data?.response ||
      ollamaRes.data?.message?.content ||
      "I couldn't find a relevant answer in your emails.";

    return res.json({ answer });
  } catch (err) {
    console.error("❌ ASK FAILED:", err.response?.data || err.message || err);
    return res.status(500).json({ error: "Ask assistant failed", details: err.message });
  }
};
