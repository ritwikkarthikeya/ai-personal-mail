import { pool } from "../../config/db.js";
import { googleClient } from "../../config/google.js";

export const authService = {
  async saveUser(tokens) {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const refreshToken = tokens.refresh_token || null;

    const query = `
      INSERT INTO users (email, name, google_refresh_token)
      VALUES ($1, $2, $3)
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        google_refresh_token = COALESCE(users.google_refresh_token, EXCLUDED.google_refresh_token)
      RETURNING *;
    `;

    const values = [
      payload.email,
      payload.name,
      refreshToken,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },
};
