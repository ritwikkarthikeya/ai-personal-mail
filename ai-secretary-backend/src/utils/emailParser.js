export function parseEmail(message) {
  const headers = message.payload.headers;

  const getHeader = (name) =>
    headers.find((h) => h.name === name)?.value || "";

  let body = "";

  const parts = message.payload.parts || [];
  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body.data) {
      body = Buffer.from(part.body.data, "base64").toString("utf-8");
      break;
    }
  }

  return {
    gmailId: message.id,
    threadId: message.threadId,
    from: getHeader("From"),
    subject: getHeader("Subject"),
    body,
    receivedAt: new Date(Number(message.internalDate)),
  };
}
