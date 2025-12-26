import { Router } from "express";
import { askAssistant } from "./search.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/ask", requireAuth, askAssistant);

export default router;
