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

    const queryEmbedding = await generateEmbedding(question);

    const emails = await Email.find({
      user: req.user.id,
      embedding: { $exists: true, $ne: [] },
    });

    const scored = emails.map((e) => ({
      email: e,
      score: cosineSimilarity(queryEmbedding, e.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);

    const topEmails = scored.slice(0, 5).map((s) => s.email);

    const context = topEmails
      .map(
        (e) => `
Subject: ${e.subject}
From: ${e.from}
Summary: ${e.summary}
Body: ${e.body}
`
      )
      .join("\n");

    console.log("ASK CONTEXT:\n", context.slice(0, 500));

    const ollamaRes = await axios.post(
      `${process.env.OLLAMA_BASE}/api/generate`,
      {
        model: "mistral",
        prompt: `
You are an email assistant.

Here are emails from the inbox:

${context}

User question: ${question}

Give a clear helpful answer. If relevant, mention subjects.
`,
        stream: false,
      }
    );

    console.log("OLLAMA RAW:", ollamaRes.data);

    const answer =
      ollamaRes.data?.response ||
      ollamaRes.data?.message ||
      "I couldn't find a relevant answer in your emails.";

    return res.json({ answer });
  } catch (err) {
    console.error(
      "❌ ASK FAILED:",
      err.response?.data || err.message
    );

    return res.status(500).json({
      error: "Ask assistant failed",
    });
  }
};
