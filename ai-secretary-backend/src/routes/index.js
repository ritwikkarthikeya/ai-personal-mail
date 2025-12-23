import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import gmailRoutes from "../modules/gmail/gmail.routes.js";
const router = Router();

router.use("/auth", authRoutes);

router.use("/gmail", gmailRoutes);
export default router;
