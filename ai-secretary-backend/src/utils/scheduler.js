import cron from "node-cron";
import { processUnprocessedEmails } from "../modules/ai/email.processor.js";

export const startSchedulers = () => {
  // Every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Running AI email processor...");
    try {
      await processUnprocessedEmails();
      console.log("✅ AI email processing done");
    } catch (err) {
      console.error("❌ AI cron failed:", err.message);
    }
  });
};
