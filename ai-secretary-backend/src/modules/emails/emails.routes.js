import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  getEmails,
  getSummarizedEmails,
} from "./emails.controller.js";

const router = Router();

// All emails
router.get("/", requireAuth, getEmails);

// Summarized emails
router.get("/summaries", requireAuth, getSummarizedEmails);

export default router;
