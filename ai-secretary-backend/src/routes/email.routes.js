import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getEmails,
  getSummaries,
  getPriorityEmails,
} from "../controllers/email.controller.js";

const router = express.Router();

router.get("/", protect, getEmails);
router.get("/summaries", protect, getSummaries);
router.get("/priority", protect, getPriorityEmails);

export default router;
