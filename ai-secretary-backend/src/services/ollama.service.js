import axios from "axios";

export const summarizeMail = async (text) => {
  const res = await axios.post(
    `${process.env.OLLAMA_BASE}/api/generate`,
    {
      model: "mistral",
      prompt: `Summarize this email:\n${text}`
    }
  );

  return res.data.response;
};
