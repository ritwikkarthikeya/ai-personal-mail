import { Router } from "express";
import { syncMyEmails } from "./gmail.controller.js";

const router = Router();

router.post("/sync", syncMyEmails);

export default router;
