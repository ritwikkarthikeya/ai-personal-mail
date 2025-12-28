import jwt from "jsonwebtoken";
import { googleClient } from "../../config/google.js";
import { authService } from "./auth.service.js";

export const googleLogin = (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
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
    console.error("❌ Google auth failed:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};
