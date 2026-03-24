import Rental from "../models/rental.model.js";
import Message from "../models/message.model.js";
import { sendEmailReport } from "./email.service.js";

/* =========================
   Normalize date to IST (00:00)
========================= */
const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

export const checkRentReminders = async () => {
  try {
    const rentals = await Rental.find({ status: "active" }).populate(
      "customer",
    );

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

      /* =========================
         Days Used (corrected)
      ========================= */
      const daysUsed = Math.max(
        1,
        Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
      );

      /* =========================
         Days Remaining
      ========================= */
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
         Prevent duplicate alerts (per day)
      ========================= */
      const startOfDay = new Date(today);
      const endOfDay = new Date(today);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const alreadySent = await Message.findOne({
        rental: rental._id,
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      });

      if (alreadySent) continue;

      /* =========================
         Amount Calculation
      ========================= */
      const amount = rental.platesGiven * rental.rentPerPlate * daysUsed;

      const phone = rental.customer.phoneNumber.replace(/\D/g, "");

      alertList.push({
        name: rental.customer.customerName,
        phone,
        plates: rental.platesGiven,
        daysUsed,
        amount,
        status,
      });
    }

    if (alertList.length === 0) {
      console.log("No alerts today");
      return;
    }

    /* =========================
       Send Email
    ========================= */
    await sendEmailReport(alertList);

    /* =========================
       Save summary
    ========================= */
    await Message.create({
      message: JSON.stringify(alertList),
      type: "summary",
      method: "Email",
      status: "sent",
    });

    console.log("✅ Email summary sent");
  } catch (err) {
    console.log("❌ Error:", err.message);
  }
};
