import pkg from "whatsapp-web.js";
import qrcode from "qrcode";

const { Client, LocalAuth } = pkg;

let client;
let isReady = false;
let latestQR = null;

// Initialize WhatsApp client
export const initWhatsApp = async () => {
  if (client) {
    try {
      await client.destroy();
    } catch {}
  }

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true },
  });

  client.on("qr", async (qr) => {
    console.log("📱 QR RECEIVED");
    latestQR = await qrcode.toDataURL(qr);
    isReady = false;
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp Ready!");
    isReady = true;
    latestQR = null;
  });

  client.on("disconnected", (reason) => {
    console.log("❌ WhatsApp disconnected:", reason);
    isReady = false;
    latestQR = null;
    setTimeout(initWhatsApp, 3000);
  });

  client.on("auth_failure", (msg) => {
    console.log("❌ Auth failure:", msg);
    isReady = false;
    latestQR = null;
  });

  await client.initialize();
};

export const getQR = () => latestQR;
export const isWhatsAppReady = () => isReady;

export const sendWhatsAppMessage = async (phone, message) => {
  try {
    if (!isReady) return "failed";

    let number = phone.replace(/\D/g, "");
    if (!number.startsWith("91")) number = "91" + number;

    const chatId = `${number}@c.us`;
    await client.sendMessage(chatId, message);
    console.log("✅ Sent:", chatId);
    return "sent";
  } catch (err) {
    console.log("❌ Error sending message:", err.message);
    return "failed";
  }
};
