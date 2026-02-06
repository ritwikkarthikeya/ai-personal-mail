import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getEmails,
  getSummaries,
} from "../controllers/email.controller.js";

const router = express.Router();

router.get("/", protect, getEmails);
router.get("/summaries", protect, getSummaries);

export default router;
