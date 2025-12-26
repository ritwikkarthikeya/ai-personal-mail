import { apiFetch } from "./client";

export const askAssistant = (question) =>
  apiFetch("/search/ask", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
