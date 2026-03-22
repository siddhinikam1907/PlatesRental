import express from "express";
import { getFast2SMSRecharge } from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/recharge-sms", getFast2SMSRecharge);

export default router;
