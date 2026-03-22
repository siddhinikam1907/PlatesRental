import express from "express";
import {
  createRental,
  getAllRentals,
  getCustomerRentals,
  returnPlates,
  deleteRental,
} from "../controllers/rental.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/create", isAuthenticated, createRental);
router.get("/getAll", isAuthenticated, getAllRentals);
router.get("/customer/:customerId", isAuthenticated, getCustomerRentals);
router.put("/return/:rentalId", isAuthenticated, returnPlates);
router.delete("/delete/:rentalId", deleteRental);
export default router;
