import Rental from "../models/rental.model.js";
import Message from "../models/message.model.js";
import { sendWhatsAppMessage } from "./whatsapp.service.js";

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const checkRentReminders = async () => {
  try {
    const adminPhone = process.env.ADMIN_PHONE || "918010805783";

    const rentals = await Rental.find({ status: "active" }).populate(
      "customer",
    );
    if (!rentals.length) return console.log("No active rentals");

    const today = normalizeDate(new Date());

    for (let rental of rentals) {
      if (!rental.customer) continue;

      const startDate = normalizeDate(rental.rentDate);
      const expectedReturn = normalizeDate(rental.expectedReturnDate);
      const daysUsed = Math.max(
        1,
        Math.floor((today - startDate) / (1000 * 60 * 60 * 24)),
      );
      const daysRemaining = Math.ceil(
        (expectedReturn - today) / (1000 * 60 * 60 * 24),
      );

      // Skip if not due/overdue
      if (daysRemaining > 1) continue;
      if (daysRemaining < -2) continue;

      // Prevent duplicate message same day
      const todayMessages = await Message.find({
        rental: rental._id,
        customer: rental.customer._id,
        method: "WhatsApp",
        status: "sent",
        createdAt: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });
      if (todayMessages.length > 0) continue;

      const amount = rental.platesGiven * rental.rentPerPlate * daysUsed;
      const phone = rental.customer.phoneNumber.replace(/\D/g, "");
      const callLink = `tel:+91${phone}`;

      const adminMsg = `
🚨 *Rental Alert*
👤 Name: ${rental.customer.customerName}
📞 Phone: ${phone}
⏹️ Plates: ${rental.platesGiven}
💰 Amount Till Now: ₹${amount}
📅 Days Used: ${daysUsed}
📆 Return Date: ${expectedReturn.toLocaleDateString("en-IN")}
⚠ Status: ${
        daysRemaining < 0
          ? `Overdue by ${Math.abs(daysRemaining)} day(s)`
          : `Due in ${daysRemaining} day(s)`
      }
👉 Call Customer: ${callLink}
`;

      const status = await sendWhatsAppMessage(adminPhone, adminMsg);

      await Message.create({
        customer: rental.customer._id,
        rental: rental._id,
        phoneNumber: phone,
        message: adminMsg,
        type: daysRemaining < 0 ? "overdue" : "reminder",
        method: "WhatsApp",
        status,
      });

      if (status === "sent") {
        rental.lastReminderSent = new Date();
        await rental.save();
      }
    }

    console.log("✅ Admin reminders sent");
  } catch (err) {
    console.log("❌ Error:", err.message);
  }
};
