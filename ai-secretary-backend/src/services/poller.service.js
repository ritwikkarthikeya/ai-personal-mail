import cron from "node-cron";
import { syncEmails } from "../controllers/gmail.controller.js";

export const startPolling = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("📬 Polling Gmail...");
  });
};
