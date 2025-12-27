import { pool } from "../../config/db.js";
import { fetchNextEmails, fetchEmailById } from "../gmail/gmail.fetch.service.js";
 
export async function runEmailIngestionCron(userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 Lock cursor row
    const cursorRes = await client.query(
      `
      SELECT next_page_token
      FROM gmail_cursors
      WHERE user_id = $1
      FOR UPDATE SKIP LOCKED
      `,
      [userId]
    );

    if (cursorRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return;
    }

    const pageToken = cursorRes.rows[0].next_page_token || null;

    const { messages, nextPageToken } = await fetchNextEmails({
      maxResults: 5,
      pageToken,
    });

    if (!messages.length) {
      await client.query("COMMIT");
      return;
    }

    for (const msg of messages) {
      const exists = await client.query(
        `SELECT 1 FROM emails WHERE gmail_id = $1`,
        [msg.id]
      );
      if (exists.rowCount) continue;

      const email = await fetchEmailById(msg.id);

      const headers = Object.fromEntries(
        email.payload.headers.map(h => [h.name.toLowerCase(), h.value])
      );

      const subject = headers.subject || "";
      const from = headers.from || "";
      const body = email.snippet || "";

      await client.query(
        `
        INSERT INTO emails (
          id,
          user_id,
          gmail_id,
          subject,
          from_email,
          body,
          ai_processed,
          retry_count
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, FALSE, 0)
        `,
        [userId, msg.id, subject, from, body]
      );
    }

    if (nextPageToken) {
      await client.query(
        `
        INSERT INTO gmail_cursors (user_id, next_page_token)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET next_page_token = $2, updated_at = NOW()
        `,
        [userId, nextPageToken]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Gmail ingestion complete for user:", userId);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Gmail ingestion failed:", err.message);
  } finally {
    client.release();
  }
}
