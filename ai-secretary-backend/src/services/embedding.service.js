import axios from "axios";

const OLLAMA_BASE = process.env.OLLAMA_BASE || "http://localhost:11434";

export const generateEmbedding = async (text) => {
  try {
    // Try the newer /api/embed endpoint first (Ollama >= 0.1.26)
    const res = await axios.post(`${OLLAMA_BASE}/api/embed`, {
      model: "nomic-embed-text",
      input: text,
    });
    // /api/embed returns { embeddings: [[...]] }
    return res.data.embeddings?.[0] ?? res.data.embedding ?? [];
  } catch {
    try {
      // Fallback to legacy /api/embeddings endpoint
      const res = await axios.post(`${OLLAMA_BASE}/api/embeddings`, {
        model: "nomic-embed-text",
        prompt: text,
      });
      return res.data.embedding ?? [];
    } catch {
      // If embedding model not available, return empty array (search degrades gracefully)
      console.warn("⚠️  Embedding unavailable — semantic search degraded");
      return [];
    }
  }
};
