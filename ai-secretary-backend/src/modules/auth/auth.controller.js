import jwt from "jsonwebtoken";
import { googleClient } from "../../config/google.js";
import { authService } from "./auth.service.js";
import { runEmailIngestionCron } from "../emails/email.ingestion.cron.js";
import { processUnprocessedEmails } from "../ai/email.processor.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://ai-personal-mail.vercel.app";

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // 1️⃣ Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // 2️⃣ Save user + refresh token
    const user = await authService.saveUser(tokens);

    // 3️⃣ 🚀 INGEST GMAIL IMMEDIATELY
    console.log("📥 Ingesting Gmail for user:", user.id);
    await runEmailIngestionCron(user.id);

    // 4️⃣ 🤖 Run AI processing immediately
    console.log("🤖 Processing emails for user:", user.id);
    await processUnprocessedEmails(user.id);

    // 5️⃣ Create JWT
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Redirect to frontend
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${jwtToken}`);

  } catch (err) {
    console.error("❌ Google callback failed:", err);
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
  }
};
