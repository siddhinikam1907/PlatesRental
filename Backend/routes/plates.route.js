import express from "express";
import {
  getPlateStock,
  setPlateStock,
  updatePlateStock,
} from "../controllers/plate.controller.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

/* ---------------- PLATE STOCK ROUTES ---------------- */
router.get("/getAll", isAuthenticated, getPlateStock);
router.post("/set-stock", isAuthenticated, setPlateStock);
router.put("/update", isAuthenticated, updatePlateStock);

export default router;
