import fetch from "node-fetch";

const OLLAMA_URL = "http://localhost:11434/api/embeddings";
const MODEL = "nomic-embed-text"; // 768-dim

export const embeddingService = {
  async embed(text) {
    if (!text || typeof text !== "string" || !text.trim()) {
      return null;
    }

    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: text, // ✅ CORRECT FIELD FOR OLLAMA 0.13.x
      }),
    });

    if (!res.ok) {
      console.error("❌ Ollama embedding request failed");
      return null;
    }

    const data = await res.json();

    // ✅ CORRECT RESPONSE SHAPE FOR OLLAMA
    const embedding = data?.embedding;

    if (!Array.isArray(embedding) || embedding.length === 0) {
      console.error("❌ Empty embedding from Ollama", data);
      return null;
    }

    console.log(`🧠 Embedding size: ${embedding.length}`);
    return embedding; // 768 numbers
  },
};
