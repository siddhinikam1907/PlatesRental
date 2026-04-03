import dns from "dns";

/* 🚨 FORCE IPV4 FOR GMAIL SMTP (RENDER FIX) */
dns.setDefaultResultOrder("ipv4first");

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

import { checkRentReminders } from "./services/reminder.service.js";

dotenv.config();

/* ======================================================
   GLOBAL CRASH HANDLERS
====================================================== */
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION:", err);
});

const app = express();

/* ======================================================
   MIDDLEWARE
====================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ======================================================
   CORS FIX
====================================================== */
const allowedOrigins = [
  "http://localhost:5173",
  "https://plates-rental-frontend.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  }),
);

/* ======================================================
   HEALTH CHECK ROUTES
====================================================== */
app.get("/", (req, res) => {
  res.status(200).send("Server Alive ✅");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    time: new Date(),
  });
});

/* ======================================================
   🚀 REMINDER TRIGGER API (CALLED BY cron-job.org DAILY)
====================================================== */
app.get("/api/v1/reminders/run", (req, res) => {
  console.log("⏱ Cron triggered reminders...");

  // ✅ 1. Respond immediately to cron (VERY IMPORTANT)
  res.status(200).send("OK");

  // ✅ 2. Run heavy job in background
  setImmediate(async () => {
    try {
      await checkRentReminders();
      console.log("✅ Reminder job completed");
    } catch (err) {
      console.error("❌ Reminder job failed:", err);
    }
  });
});

/* ======================================================
   ROUTES
====================================================== */
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/customer", CustomerRoutes);
app.use("/api/v1/plates", PlateRoutes);
app.use("/api/v1/rental", RentalRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/test", testRoutes);

/* ======================================================
   START SERVER
====================================================== */
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    console.log("⏳ Connecting MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
