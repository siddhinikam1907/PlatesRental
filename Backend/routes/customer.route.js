import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";

import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/create", isAuthenticated, createCustomer);
router.get("/getAll", isAuthenticated, getAllCustomers);
router.get("/:id", isAuthenticated, getCustomerById);
router.put("/:id", isAuthenticated, updateCustomer);
router.delete("/:id", isAuthenticated, deleteCustomer);

export default router;
