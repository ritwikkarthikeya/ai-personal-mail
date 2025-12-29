import jwt from "jsonwebtoken";
import { googleClient } from "../../config/google.js";
import { authService } from "./auth.service.js";
import { pool } from "../../config/db.js";

export const googleLogin = (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true, // ✅ IMPORTANT
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

    // ✅ Save / update user + refresh token
    const user = await authService.saveUser(tokens);

    // ✅ ENSURE gmail_cursors row exists (CRITICAL)
    await pool.query(
      `
      INSERT INTO gmail_cursors (user_id, next_page_token)
      VALUES ($1, NULL)
      ON CONFLICT (user_id) DO NOTHING
      `,
      [user.id]
    );

    // ✅ Issue JWT for frontend
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);
    return res.redirect(`${FRONTEND_URL}/auth/callback?token=${jwtToken}`);
  } catch (err) {
    console.error("❌ Google callback failed:", err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=auth_failed`
    );
  }
};
