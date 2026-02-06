import dotenv from "dotenv";
dotenv.config();

// Dynamic imports AFTER env is ready
const { default: app } = await import("./app.js");
const { connectDB } = await import("./config/db.js");

await connectDB();

app.listen(process.env.PORT || 5003, () => {
  console.log("🚀 Server running on", process.env.PORT || 5003);
});
