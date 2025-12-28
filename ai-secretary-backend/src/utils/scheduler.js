import cron from "node-cron";
import { pool } from "../config/db.js";
import { runEmailIngestionCron } from "../modules/emails/email.ingestion.cron.js";
import { processUnprocessedEmails } from "../modules/ai/email.processor.js";

let isRunning = false; // 🔒 Prevent overlapping runs

export const startSchedulers = () => {
  if (process.env.DISABLE_CRON === "true") {
    console.log("⏸️ Cron disabled");
    return;
  }

  console.log("🚀 Starting schedulers...");

  cron.schedule("*/5 * * * *", async () => {
    if (isRunning) {
      console.log("⏭️ Previous cron still running, skipping tick");
      return;
    }

    isRunning = true;
    console.log("⏰ Cron tick");

    try {
      const { rows: users } = await pool.query(`
        SELECT user_id
        FROM gmail_cursors
      `);

      if (!users.length) {
        console.log("ℹ️ No users found for ingestion");
        return;
      }

      for (const { user_id } of users) {
        if (!user_id) continue;

        try {
          console.log(`📥 Ingesting emails for user: ${user_id}`);
          await runEmailIngestionCron(user_id);

          console.log(`🤖 Processing AI emails for user: ${user_id}`);
          await processUnprocessedEmails(user_id);
        } catch (userErr) {
          console.error(
            `❌ Cron failed for user ${user_id}:`,
            userErr.message
          );
        }
      }
    } catch (err) {
      console.error("❌ Cron tick failed:", err.message);
    } finally {
      isRunning = false;
    }
  });
};
