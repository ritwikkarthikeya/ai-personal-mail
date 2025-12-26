import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import gmailRoutes from "../modules/gmail/gmail.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";
import searchRoutes from "../modules/search/search.routes.js";
import emailRoutes from "../modules/emails/emails.routes.js";


const router = Router();

console.log("Setting up routes");

router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/gmail", gmailRoutes);
router.use("/search", searchRoutes);
router.use("/emails", emailRoutes);

export default router;

