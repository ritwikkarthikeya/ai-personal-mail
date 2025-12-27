import { Router } from "express";
import { runEmailAI, runEmbeddingJob } from "./ai.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

console.log("✅ AI routes registered");

router.post("/process-emails", requireAuth, runEmailAI);
router.post("/embed-emails", requireAuth, runEmbeddingJob);

export default router;
