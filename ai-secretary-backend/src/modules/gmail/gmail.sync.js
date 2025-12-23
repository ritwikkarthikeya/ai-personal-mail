import { pool } from "../../config/db.js";
import { gmailService } from "../../services/gmail.service.js";
import { parseEmail } from "../../utils/emailParser.js";

export const syncEmailsForUser = async (user) => {
  const gmail = await gmailService.getClient(user.google_refresh_token);
  const messages = await gmailService.listMessages(gmail);

  for (const msg of messages) {
    const fullMessage = await gmailService.getMessage(gmail, msg.id);
    const email = parseEmail(fullMessage);

    await pool.query(
      `
      INSERT INTO emails (
        user_id, gmail_id, thread_id,
        from_email, subject, body, received_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (gmail_id) DO NOTHING;
      `,
      [
        user.id,
        email.gmailId,
        email.threadId,
        email.from,
        email.subject,
        email.body,
        email.receivedAt,
      ]
    );
  }
};
