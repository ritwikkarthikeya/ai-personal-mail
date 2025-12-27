 
import "./config/env.js";
import app from "./app.js";
import { env } from "./config/env.js";
import { startSchedulers } from "./utils/scheduler.js";

app.listen(env.port || 5000, () => {
  console.log(`🚀 Server running on port ${env.port || 5000}`);
  console.log("🚀 Starting schedulers...");
  startSchedulers(); // 👈 START BACKGROUND JOBS
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ai-secretary-backend",
    timestamp: new Date().toISOString(),
  });
});
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Starting schedulers...");
  startSchedulers();
}
