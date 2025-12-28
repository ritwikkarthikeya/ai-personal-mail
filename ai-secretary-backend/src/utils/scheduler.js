import cron from "node-cron";
import { pool } from "../config/db.js";
import { runEmailIngestionCron } from "../modules/emails/email.ingestion.cron.js";
import { processUnprocessedEmails } from "../modules/ai/email.processor.js";

export const startSchedulers = () => {
  if (process.env.DISABLE_CRON === "true") {
    console.log("⏸️ Cron disabled");
    return;
  }

  console.log("🚀 Starting schedulers...");

  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Cron tick");

    const { rows } = await pool.query(`
      SELECT user_id
      FROM gmail_cursors
    `);

    for (const { user_id } of rows) {
      await runEmailIngestionCron(user_id);
      await processUnprocessedEmails(user_id);
    }
  });
};
