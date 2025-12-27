import { pool } from "../../config/db.js";
import { googleClient } from "../../config/google.js";

export const authService = {
  async saveUser(tokens) {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const query = `
      INSERT INTO users (email, name, google_refresh_token)
      VALUES ($1, $2, $3)
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        google_refresh_token = COALESCE(
          EXCLUDED.google_refresh_token,
          users.google_refresh_token
        )
      RETURNING *;
    `;

    const values = [
      payload.email,
      payload.name,
      tokens.refresh_token ?? null,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },
};
