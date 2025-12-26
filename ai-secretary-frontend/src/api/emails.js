import { apiFetch } from "./client";

export const fetchEmails = () => apiFetch("/emails");
export const fetchSummarizedEmails = () =>
  apiFetch("/emails/summarized");
