import { apiFetch } from "../utils/api";

export const fetchEmails = () => apiFetch("/emails");

export const fetchSummarizedEmails = () =>
  apiFetch("/emails/summaries");
