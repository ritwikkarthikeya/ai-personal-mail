import { processUnprocessedEmails } from "./email.processor.js";

export const runEmailAI = async (req, res) => {
  await processUnprocessedEmails();
  res.json({ message: "AI processing completed using Ollama (mistral)" });
};
