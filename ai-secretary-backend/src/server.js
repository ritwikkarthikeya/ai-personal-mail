import "./config/env.js";
import app from "./app.js";
import { startSchedulers } from "./utils/scheduler.js";

const PORT = Number(process.env.PORT);

if (!PORT) {
  console.error("❌ PORT is not defined");
  process.exit(1);
}

/* REQUIRED FOR KOYEB */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ai-secretary-backend",
    timestamp: new Date().toISOString(),
  });
});

let schedulersStarted = false;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);

  if (!schedulersStarted) {
    startSchedulers();
    schedulersStarted = true;
  }
});
