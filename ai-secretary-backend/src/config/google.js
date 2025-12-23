import { OAuth2Client } from "google-auth-library";
import { env } from "./env.js";

export const googleClient = new OAuth2Client(
  env.google.clientId,
  env.google.clientSecret,
  env.google.redirectUri
);
