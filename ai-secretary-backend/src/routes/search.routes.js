import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { askAssistant } from "../controllers/search.controller.js";

const router = express.Router();

router.post("/ask", protect, askAssistant);

export default router;
