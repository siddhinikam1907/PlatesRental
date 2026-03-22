import { getQR, isWhatsAppReady } from "../services/whatsapp.service.js";

export const getQRCode = (req, res) => {
  try {
    const qr = getQR();

    if (qr) {
      return res.json({ success: true, qrDataUrl: qr });
    }

    if (isWhatsAppReady()) {
      return res.json({
        success: true,
        ready: true,
        message: "✅ WhatsApp already connected",
      });
    }

    // If session missing → QR will be generated automatically
    return res.json({
      success: true,
      qrDataUrl: null,
      message: "⚠ WhatsApp disconnected, scan QR again",
    });
  } catch (err) {
    console.error("Error fetching QR:", err.message);
    return res.status(500).json({
      success: false,
      message: "❌ Error fetching QR code",
    });
  }
};
