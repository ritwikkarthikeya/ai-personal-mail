import { processUnprocessedEmails } from "./email.processor.js";
import { generateEmailEmbeddings } from "../../jobs/emailEmbedding.job.js";

export const runEmailAI = async (req, res) => {
  const userId = req.user.id;

  await processUnprocessedEmails(userId);

  res.json({
    message: "AI email processing completed",
    userId,
  });
};

export const runEmbeddingJob = async (req, res) => {
  const userId = req.user.id;

  await generateEmailEmbeddings(userId);

  res.json({
    message: "Embedding job completed",
    userId,
  });
};
