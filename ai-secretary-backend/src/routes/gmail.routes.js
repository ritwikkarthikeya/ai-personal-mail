import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { syncEmails } from "../controllers/gmail.controller.js";

const router = express.Router();

router.post("/sync", protect, syncEmails);

export default router;
