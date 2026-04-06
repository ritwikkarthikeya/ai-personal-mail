import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getEvents, createEventFromEmail } from "../controllers/calendar.controller.js";

const router = express.Router();

router.get("/events", protect, getEvents);
router.post("/create-from-email", protect, createEventFromEmail);

export default router;
