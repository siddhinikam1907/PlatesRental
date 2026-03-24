import nodemailer from "nodemailer";

export const sendEmailReport = async (alertList) => {
  try {
    if (!alertList || alertList.length === 0) {
      console.log("No alerts to send");
      return;
    }

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

    alertList.forEach((c) => {
      htmlContent += `
        <tr>
          <td>${c.name}</td>
          <td>${c.phone}</td>
          <td>${c.plates}</td>
          <td>${c.daysUsed}</td>
          <td>${c.status}</td>
          <td>₹${c.amount}</td>
        </tr>
      `;
    });

    htmlContent += `</table>`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: "🚨 Plate Rental Daily Alert",
      html: htmlContent,
    });

    console.log("✅ Email sent successfully");
  } catch (err) {
    console.log("❌ Email Error:", err.message);
  }
};
