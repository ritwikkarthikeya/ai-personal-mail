 
import "./config/env.js";
import app from "./app.js";
import { env } from "./config/env.js";
import { startSchedulers } from "./utils/scheduler.js";
const PORT = process.env.PORT || 5003;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
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
