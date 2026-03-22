import express from "express";
import {
  getAllMessages,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/getAll", getAllMessages);
router.delete("/delete/:id", deleteMessage);

export default router;
