import { pool } from "../../config/db.js";
import { fetchNextEmails, fetchEmailById } from "../gmail/gmail.fetch.service.js";

export async function runEmailIngestionCron(userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔒 Lock or create cursor
    const cursorRes = await client.query(
      `
      SELECT next_page_token
      FROM gmail_cursors
      WHERE user_id = $1
      FOR UPDATE
      `,
      [userId]
    );

    let pageToken = null;

    // 🆕 FIRST TIME USER → CREATE CURSOR
    if (cursorRes.rowCount === 0) {
      await client.query(
        `
        INSERT INTO gmail_cursors (user_id, next_page_token)
        VALUES ($1, NULL)
        `,
        [userId]
      );
    } else {
      pageToken = cursorRes.rows[0].next_page_token;
    }

    // 📥 FETCH EMAILS
    const { messages, nextPageToken } = await fetchNextEmails({
      maxResults: 10,
      pageToken,
    });

    if (!messages || messages.length === 0) {
      await client.query("COMMIT");
      console.log("📭 No new emails for user:", userId);
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
          retry_count,
          created_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, FALSE, 0, NOW())
        `,
        [userId, msg.id, subject, from, body]
      );
    }

    // 🔁 UPDATE CURSOR
    if (nextPageToken) {
      await client.query(
        `
        UPDATE gmail_cursors
        SET next_page_token = $2,
            updated_at = NOW()
        WHERE user_id = $1
        `,
        [userId, nextPageToken]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Gmail ingestion complete for user:", userId);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Gmail ingestion failed:", err);
  } finally {
    client.release();
  }
}
