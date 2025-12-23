import { googleClient } from "../../config/google.js";
import { authService } from "./auth.service.js";

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
  const { code } = req.query;

  const { tokens } = await googleClient.getToken(code);
  googleClient.setCredentials(tokens);

  const user = await authService.saveUser(tokens);

  res.json({
    message: "Login successful",
    user,
  });
};
