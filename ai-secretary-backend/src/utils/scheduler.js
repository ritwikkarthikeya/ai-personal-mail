import cron from "node-cron";
import { pool } from "../config/db.js";
import { runEmailIngestionCron } from "../modules/emails/email.ingestion.cron.js";
import { processUnprocessedEmails } from "../modules/ai/email.processor.js";

export const startSchedulers = () => {
  console.log("🚀 Starting schedulers...");

  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Cron tick");

    const { rows: users } = await pool.query(`
      SELECT DISTINCT user_id
      FROM gmail_cursors
    `);

    for (const { user_id } of users) {
      await runEmailIngestionCron(user_id);
      await processUnprocessedEmails(user_id);
    }
  });
};
