import express from "express";
import {
  getAdminProfile,
  login,
  registerAdmin,
  logout,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();
router.post("/register", registerAdmin);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", isAuthenticated, getAdminProfile);
export default router;
