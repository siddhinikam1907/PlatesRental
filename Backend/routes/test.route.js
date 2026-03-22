import express from "express";
import { checkRentReminders } from "../services/reminder.service.js";

const router = express.Router();

router.get("/test-sms", async (req, res) => {
  console.log("🚀 Manual SMS trigger...");
  await checkRentReminders();
  res.send("SMS check completed");
});

export default router;