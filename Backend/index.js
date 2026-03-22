import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

import AdminRoutes from "./routes/admin.route.js";
import CustomerRoutes from "./routes/customer.route.js";
import PlateRoutes from "./routes/plates.route.js";
import RentalRoutes from "./routes/rental.route.js";
import PaymentRoutes from "./routes/payment.route.js";
import messageRoutes from "./routes/message.route.js";
import testRoutes from "./routes/test.route.js";
import whatsappRoutes from "./routes/whatsapp.route.js";

import cron from "node-cron";
import { checkRentReminders } from "./services/reminder.service.js";
import { initWhatsApp, isWhatsAppReady } from "./services/whatsapp.service.js";

dotenv.config();

const app = express();

// ✅ INIT WHATSAPP
initWhatsApp();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

/* =========================
   ✅ FIXED CRON (IMPORTANT)
========================= */
cron.schedule("30 10 * * *", async () => {
  console.log("⏱ Running cron...");

  // 🚨 Check if WhatsApp is ready
  if (!isWhatsAppReady()) {
    console.log(
      "⛔ WhatsApp not ready, skipping reminders. Will retry next cron.",
    );
    return;
  }

  try {
    await checkRentReminders();
    console.log("✅ Reminders sent successfully.");
  } catch (err) {
    console.log("❌ Error in sending reminders:", err.message);
  }
});

/* =========================
   ✅ ROUTES
========================= */
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/customer", CustomerRoutes);
app.use("/api/v1/plates", PlateRoutes);
app.use("/api/v1/rental", RentalRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/whatsapp", whatsappRoutes);

/* =========================
   ✅ TEST ROUTE
========================= */
app.get("/test-sms", async (req, res) => {
  if (!isWhatsAppReady()) {
    return res.send("❌ WhatsApp not ready");
  }

  await checkRentReminders();
  res.send("✅ Reminder triggered");
});

/* =========================
   ✅ START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
