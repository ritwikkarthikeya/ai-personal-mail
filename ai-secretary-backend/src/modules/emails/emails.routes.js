import { Router } from "express";
import {
  getEmails,
  getSummarizedEmails,
} from "./emails.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getEmails);
router.get("/summarized", requireAuth, getSummarizedEmails);

export default router;
