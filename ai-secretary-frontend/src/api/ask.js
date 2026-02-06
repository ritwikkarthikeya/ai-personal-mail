import { apiFetch } from "../utils/api";

export const askAssistant = (question) =>
  apiFetch("/search/ask", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
