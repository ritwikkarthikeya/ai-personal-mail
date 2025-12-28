cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Cron tick");

  const { rows: users } = await pool.query(`
    SELECT DISTINCT user_id
    FROM gmail_cursors
    WHERE user_id IS NOT NULL
  `);

  for (const { user_id } of users) {
    if (!user_id) continue; // 🛑 HARD STOP

    await runEmailIngestionCron(user_id);
    await processUnprocessedEmails(user_id);
  }
});
