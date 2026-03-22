import { useEffect, useState } from "react";
import axios from "axios";
import { QR_API } from "../utils/constant.js";

export default function QRScan({ setWhatsappReady }) {
  const [qr, setQR] = useState("");
  const [status, setStatus] = useState("Generating QR code...");

  const REFRESH_INTERVAL =
    parseInt(process.env.REACT_APP_QR_REFRESH_INTERVAL) || 2000;

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/whatsapp/qr`,
        );
        if (res.data.qrDataUrl) {
          setQR(res.data.qrDataUrl);
          setStatus("📱 Scan this QR code on WhatsApp to login");
          setWhatsappReady(false);
        } else if (res.data.ready) {
          setQR("");
          setStatus("✅ WhatsApp already connected");
          setWhatsappReady(true);
        } else {
          setQR("");
          setStatus("⚠ WhatsApp disconnected, scan QR again");
          setWhatsappReady(false);
        }
      } catch (err) {
        setStatus("❌ Error fetching QR code");
        setWhatsappReady(false);
      }
    };

    fetchQR();
    const interval = setInterval(fetchQR, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [setWhatsappReady]);

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl font-bold mb-4">Scan WhatsApp QR</h2>
      <p className="mb-4">{status}</p>
      {qr && <img src={qr} alt="QR Code" className="border p-2 w-64 h-64" />}
    </div>
  );
}
