import jwt from "jsonwebtoken";
import { createOAuthClient } from "../config/google.js";
import User from "../models/User.js";

export const googleLogin = (req, res) => {
  const oauth2Client = createOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/calendar",
      "profile",
      "email",
    ],
    access_type: "offline",
    prompt: "consent",
  });

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  const oauth2Client = createOAuthClient();

  const { tokens } = await oauth2Client.getToken(req.query.code);
  oauth2Client.setCredentials(tokens);

  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
  });

  const payload = ticket.getPayload();

  let user = await User.findOne({ googleId: payload.sub });

  if (!user) {
    user = await User.create({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  } else {
    // Always refresh tokens to pick up new scopes
    user.accessToken = tokens.access_token;
    if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
    await user.save();
  }

  const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.redirect(
    `${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`
  );
};
