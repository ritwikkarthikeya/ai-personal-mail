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

    /* 🔹 CREATE gmail cursor (ONLY ONCE) */
    await pool.query(
      `
      INSERT INTO gmail_cursors (user_id, next_page_token)
      VALUES ($1, NULL)
      ON CONFLICT (user_id) DO NOTHING
      `,
      [user.id]
    );

    /* 🔹 START INGESTION IMMEDIATELY */
    await runEmailIngestionCron(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const FRONTEND_URL = process.env.FRONTEND_URL;
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    console.error("❌ Google auth failed:", err.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};
