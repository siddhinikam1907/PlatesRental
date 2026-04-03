import Rental from "../models/rental.model.js";
import Message from "../models/message.model.js";
import { sendEmailReport } from "./email.service.js";
import { calculateRent } from "../utils/rentCalculator.js";

/* =========================
   Normalize to IST date only
========================= */
const getISTDateOnly = (date = new Date()) => {
  const ist = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );

  ist.setHours(0, 0, 0, 0);
  return ist;
};

export const checkRentReminders = async () => {
  try {
    console.log("🔔 Running rent reminder job...");

    const today = getISTDateOnly();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    /* =========================
       PREVENT WHOLE JOB FROM RUNNING TWICE
    ========================= */
    const alreadyRan = await Message.findOne({
      type: "daily-reminder-job",
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (alreadyRan) {
      console.log("⏭ Reminder job already executed today");
      return;
    }

    const rentals = await Rental.find({ status: "active" }).populate(
      "customer",
    );

    console.log("📦 Active rentals found:", rentals.length);

    const alertList = [];

    for (const rental of rentals) {
      if (!rental.customer) continue;

      const rentDate = getISTDateOnly(rental.rentDate);
      const returnDate = getISTDateOnly(rental.expectedReturnDate);

      const daysUsed = Math.max(
        1,
        Math.ceil((today - rentDate) / (1000 * 60 * 60 * 24)),
      );

      const daysRemaining = Math.ceil(
        (returnDate - today) / (1000 * 60 * 60 * 24),
      );

      let status = null;

      if (daysRemaining === 2) {
        status = "Due in 2 days";
      } else if (daysRemaining === 1) {
        status = "Due tomorrow";
      } else if (daysRemaining === 0) {
        status = "Due TODAY ⚠️";
      } else if (daysRemaining < 0) {
        status = `Overdue by ${Math.abs(daysRemaining)} day(s)`;
      }

      if (!status) continue;

      /* =========================
         PREVENT DUPLICATE PER RENTAL
      ========================= */
      const alreadySent = await Message.findOne({
        rental: rental._id,
        type: "reminder",
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      if (alreadySent) {
        console.log(
          `⏭ Already sent today for ${rental.customer.customerName}`,
        );
        continue;
      }

      const amount = calculateRent(
        rental.platesGiven,
        rental.rentPerPlate,
        daysUsed,
      );

      alertList.push({
        rentalId: rental._id,
        name: rental.customer.customerName,
        phone: rental.customer.phoneNumber.replace(/\D/g, ""),
        plates: rental.platesGiven,
        daysUsed,
        amount,
        status,
      });
    }

    if (alertList.length === 0) {
      console.log("📭 No reminders to send today");

      // mark whole job as completed so cron retries don't rerun
      await Message.create({
        type: "daily-reminder-job",
        message: "Reminder job executed - no alerts",
        status: "success",
      });

      return;
    }

    await sendEmailReport(alertList);

    console.log("📧 Email sent to admin");

    await Message.insertMany([
      ...alertList.map((item) => ({
        rental: item.rentalId,
        message: `Reminder sent: ${item.status}`,
        type: "reminder",
        method: "Email",
        status: "sent",
      })),
      {
        type: "daily-reminder-job",
        message: "Reminder job executed successfully",
        status: "success",
      },
    ]);

    console.log("✅ Reminder job finished successfully");
  } catch (err) {
    console.error("❌ Reminder job error:", err);
    throw err;
  }
};
