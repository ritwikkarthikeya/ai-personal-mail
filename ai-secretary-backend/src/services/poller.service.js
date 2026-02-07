import cron from "node-cron";
import User from "../models/User.js";
import { syncEmails } from "../controllers/gmail.controller.js";

// runs every 5 minutes
export const startPolling = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Background Gmail poll started");

    const users = await User.find({
      refreshToken: { $exists: true },
    });

    for (const user of users) {
      try {
        await syncEmails(
          { user: { id: user._id } },
          {
            json: () => {},
            status: () => ({ json: () => {} }),
          }
        );

        console.log("✅ Polled user:", user.email);
      } catch (err) {
        console.error("❌ Poll failed:", user.email, err.message);
      }
    }
  });
};
