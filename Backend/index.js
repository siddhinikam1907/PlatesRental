import dns from "dns";

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

import cron from "node-cron";
import { checkRentReminders } from "./services/reminder.service.js";

dotenv.config();
/* =========================
   GLOBAL ERROR HANDLERS (CRITICAL)
========================= */
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://plates-rental-frontend.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.status(200).send("Backend is alive 🚀");
});
/* =========================
   CRON JOB
========================= */
cron.schedule(
  "59 23 * * *",
  async () => {
    console.log("⏱ Running cron TEST at 11:55 PM IST...");

    try {
      await checkRentReminders();
      console.log("✅ Reminders sent successfully.");
    } catch (err) {
      console.error("❌ Cron failed:", err);
    }
  },
  {
    timezone: "Asia/Kolkata",
  },
);

/* =========================
   ROUTES
========================= */
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/customer", CustomerRoutes);
app.use("/api/v1/plates", PlateRoutes);
app.use("/api/v1/rental", RentalRoutes);
app.use("/api/v1/payment", PaymentRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/test", testRoutes);

/* =========================
   TEST ROUTE
========================= */
app.get("/test-sms", async (req, res) => {
  await checkRentReminders();
  res.send("✅ Reminder triggered");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
