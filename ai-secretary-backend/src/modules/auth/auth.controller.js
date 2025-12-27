import jwt from "jsonwebtoken";
import { googleClient } from "../../config/google.js";
import { authService } from "./auth.service.js";

const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not defined");
}

export const googleLogin = (req, res) => {
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
    prompt: "consent",
  });

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      throw new Error("No auth code received from Google");
    }

    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    const user = await authService.saveUser(tokens);

    if (!user) {
      throw new Error("User save failed");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);

  } catch (err) {
    console.error("❌ GOOGLE AUTH ERROR:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};
