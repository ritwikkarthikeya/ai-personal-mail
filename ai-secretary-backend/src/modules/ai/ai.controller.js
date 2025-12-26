import { processUnprocessedEmails } from "./email.processor.js";
import { generateEmailEmbeddings } from "../../jobs/emailEmbedding.job.js";

export const runEmailAI = async (req, res) => {
  await processUnprocessedEmails();
  res.json({ message: "AI processing completed using Ollama (mistral)" });
};


export const runEmbeddingJob = async (req, res) => {
  await generateEmailEmbeddings();
  res.json({ message: "Embedding job completed" });
};
