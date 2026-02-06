import axios from "axios";

export const generateEmbedding = async (text) => {
  const res = await axios.post(
    `${process.env.OLLAMA_BASE}/api/embeddings`,
    {
      model: "nomic-embed-text",
      prompt: text
    }
  );

  return res.data.embedding;
};
