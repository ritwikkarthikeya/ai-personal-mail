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
      DO UPDATE SET google_refresh_token = $3
      RETURNING *;
    `;

    const values = [
      payload.email,
      payload.name,
      tokens.refresh_token,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },
};
