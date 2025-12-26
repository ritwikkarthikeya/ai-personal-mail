import { Router } from "express";
import { runEmailAI } from "./ai.controller.js";
const router = Router();
console.log("✅ AI routes registered");

router.post("/process-emails", runEmailAI);
 

export default router;
