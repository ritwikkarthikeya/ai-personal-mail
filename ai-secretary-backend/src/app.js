import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import gmailRoutes from "./routes/gmail.routes.js";
import searchRoutes from "./routes/search.routes.js";
import emailRoutes from "./routes/email.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/emails", emailRoutes);

export default app;
