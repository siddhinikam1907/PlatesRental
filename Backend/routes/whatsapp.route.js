import express from "express";
import { getQRCode } from "../controllers/whatsapp.controller.js";

const router = express.Router();

router.get("/qr", getQRCode);

export default router;
