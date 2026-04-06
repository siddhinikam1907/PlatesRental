import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailReport = async (alertList) => {
  if (!alertList || alertList.length === 0) return;

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  let htmlContent = `
    <h2>🚧 Plate Rental Daily Report</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
      <tr>
        <th>Customer</th>
        <th>Phone</th>
        <th>Plates</th>
        <th>Days Used</th>
        <th>Status</th>
        <th>Amount</th>
      </tr>
  `;

  for (const item of alertList) {
    htmlContent += `
      <tr>
        <td>${item.name}</td>
        <td>${item.phone}</td>
        <td>${item.plates}</td>
        <td>${item.daysUsed}</td>
        <td>${item.status}</td>
        <td>₹${item.amount}</td>
      </tr>
    `;
  }

  htmlContent += `</table>`;

  const { data, error } = await resend.emails.send({
    from: "Plate Rental <onboarding@resend.dev>",
    to: ADMIN_EMAIL,
    subject: "🚨 Plate Rental Daily Alert",
    html: htmlContent,
  });

  if (error) {
    console.error("❌ Resend error:", error);
    throw new Error(error.message || "Failed to send email");
  }

  console.log("✅ Email sent successfully", data);
};
