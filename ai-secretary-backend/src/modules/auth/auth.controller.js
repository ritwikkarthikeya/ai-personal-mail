import jwt from "jsonwebtoken";
import { googleClient } from "../../config/google.js";
import { authService } from "./auth.service.js";
import { pool } from "../../config/db.js";
import { runEmailIngestionCron } from "../emails/email.ingestion.cron.js";

export const googleLogin = (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: false, 
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
    prompt: "consent",
  });

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const user = await authService.saveUser(tokens);

    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const FRONTEND_URL = "https://ai-personal-mail.vercel.app";
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${jwtToken}`);

  } catch (err) {
    console.error("❌ Google callback failed:", err);
    return res.redirect(
      "https://ai-personal-mail.vercel.app/login?error=auth_failed"
    );
  }
};

