import Rental from "../models/rental.model.js";
import Message from "../models/message.model.js";
import { sendEmailReport } from "./email.service.js";
import { calculateRent } from "../utils/rentCalculator.js";

/* =========================
   Normalize date to IST (00:00)
========================= */
const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

export const checkRentReminders = async () => {
  try {
    console.log("🔔 Running rent reminder job...");

    const rentals = await Rental.find({ status: "active" }).populate(
      "customer",
    );

    console.log("📦 Active rentals found:", rentals.length);

    if (!rentals.length) {
      console.log("No active rentals");
      return;
    }

    const today = normalizeDate(new Date());
    let alertList = [];

    for (let rental of rentals) {
      if (!rental.customer) continue;

      const startDate = normalizeDate(rental.rentDate);
      const expectedReturn = normalizeDate(rental.expectedReturnDate);

      const daysUsed = Math.max(
        1,
        Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
      );

      const daysRemaining = Math.ceil(
        (expectedReturn - today) / (1000 * 60 * 60 * 24),
      );

      let shouldSend = false;
      let status = "";

      if (daysRemaining === 2) {
        shouldSend = true;
        status = "Due in 2 days";
      } else if (daysRemaining === 1) {
        shouldSend = true;
        status = "Due tomorrow";
      } else if (daysRemaining === 0) {
        shouldSend = true;
        status = "Due TODAY ⚠️";
      } else if (daysRemaining < 0) {
        shouldSend = true;
        status = `Overdue by ${Math.abs(daysRemaining)} day(s)`;
      }

      if (!shouldSend) continue;

      /* =========================
         PREVENT DUPLICATE EMAIL PER DAY
      ========================= */
      const startOfDay = new Date(today);
      const endOfDay = new Date(today);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const alreadySent = await Message.findOne({
        rental: rental._id, // ⭐ IMPORTANT FIX
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });

      if (alreadySent) {
        console.log("⏭ Already sent today:", rental.customer.customerName);
        continue;
      }

      /* =========================
         USE REAL RENT CALCULATION
      ========================= */
      const amount = calculateRent(
        rental.platesGiven,
        rental.rentPerPlate,
        daysUsed,
      );

      const phone = rental.customer.phoneNumber.replace(/\D/g, "");

      alertList.push({
        rentalId: rental._id, // ⭐ used to store message record
        name: rental.customer.customerName,
        phone,
        plates: rental.platesGiven,
        daysUsed,
        amount,
        status,
      });
    }

    if (alertList.length === 0) {
      console.log("📭 No reminders to send today");
      return;
    }

    /* =========================
       SEND EMAIL
    ========================= */
    await sendEmailReport(alertList);

    console.log("📧 Email sent to admin");

    /* =========================
       SAVE MESSAGE ENTRY PER RENTAL (IMPORTANT)
    ========================= */
    const messages = alertList.map((item) => ({
      rental: item.rentalId,
      message: `Reminder sent: ${item.status}`,
      type: "reminder",
      method: "Email",
      status: "sent",
    }));

    await Message.insertMany(messages);

    console.log("✅ Reminder job finished successfully");
  } catch (err) {
    console.log("❌ Reminder job error:", err.message);
  }
};
