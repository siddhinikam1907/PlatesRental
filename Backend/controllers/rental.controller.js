import Rental from "../models/rental.model.js";
import Customer from "../models/customer.model.js";
import Plate from "../models/plate.model.js";
import { calculateRent } from "../utils/rentCalculator.js";

/* =========================
   CREATE RENTAL
========================= */
export const createRental = async (req, res) => {
  try {
    let { customerId, platesGiven, expectedDays } = req.body;

    platesGiven = Number(platesGiven);
    expectedDays = Number(expectedDays);

    if (!customerId || !platesGiven || !expectedDays) {
      return res.status(400).json({
        message: "customerId, platesGiven and expectedDays are required",
        success: false,
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
        success: false,
      });
    }

    const plates = await Plate.findOne();

    if (!plates) {
      return res.status(500).json({
        message: "Plate inventory not initialized",
        success: false,
      });
    }

    if (plates.availablePlates < platesGiven) {
      return res.status(400).json({
        message: "Not enough plates available",
        success: false,
      });
    }

    // IST date
    const rentDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    rentDate.setHours(0, 0, 0, 0);

    const expectedReturnDate = new Date(rentDate);
    expectedReturnDate.setDate(expectedReturnDate.getDate() + expectedDays);

    const rental = await Rental.create({
      customer: customerId,
      platesGiven,
      rentPerPlate: plates.rentPerPlate,
      rentDate,
      expectedDays,
      expectedReturnDate,
      status: "active",
    });

    // ✅ Stock update
    plates.availablePlates -= platesGiven;
    plates.rentedPlates += platesGiven;

    if (plates.availablePlates < 0) plates.availablePlates = 0;

    await plates.save();

    res.status(201).json({
      message: "Rental created successfully",
      success: true,
      rental,
    });
  } catch (error) {
    console.log("Error creating rental:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/* =========================
   GET ALL RENTALS
========================= */
export const getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("customer")
      .sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedRentals = rentals.map((rental) => {
      const rentDate = new Date(rental.rentDate);
      rentDate.setHours(0, 0, 0, 0);

      const expectedReturnDate = new Date(rental.expectedReturnDate);
      expectedReturnDate.setHours(0, 0, 0, 0);

      const daysUsed = Math.max(
        1,
        Math.floor((today - rentDate) / (1000 * 60 * 60 * 24)) + 1,
      );

      const currentAmount = calculateRent(
        rental.platesGiven,
        rental.rentPerPlate,
        daysUsed,
      );
      const daysRemaining = Math.ceil(
        (expectedReturnDate - today) / (1000 * 60 * 60 * 24),
      );

      let deadlineStatus = "Within Time";
      if (daysRemaining === 1) deadlineStatus = "Deadline Tomorrow";
      else if (daysRemaining === 0) deadlineStatus = "Return Today";
      else if (daysRemaining < 0)
        deadlineStatus = `Overdue by ${Math.abs(daysRemaining)} day(s)`;

      return {
        ...rental.toObject(),
        daysUsed,
        currentAmount,
        daysRemaining,
        deadlineStatus,
      };
    });

    res.status(200).json({
      success: true,
      rentals: updatedRentals,
    });
  } catch (error) {
    console.log("Error fetching rentals:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/* =========================
   GET CUSTOMER RENTALS
========================= */
export const getCustomerRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      customer: req.params.customerId,
    }).populate("customer");

    res.status(200).json({
      success: true,
      rentals,
    });
  } catch (error) {
    console.log("Error fetching customer rentals:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/* =========================
   RETURN PLATES
========================= */
export const returnPlates = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
        success: false,
      });
    }

    if (rental.status === "returned") {
      return res.status(400).json({
        message: "Plates already returned",
        success: false,
      });
    }

    const plates = await Plate.findOne();

    if (!plates) {
      return res.status(500).json({
        message: "Plate inventory not initialized",
        success: false,
      });
    }

    const today = new Date();
    const rentDate = new Date(rental.rentDate);

    const totalDays = Math.max(
      1,
      Math.floor((today - rentDate) / (1000 * 60 * 60 * 24)) + 1,
    );

    const totalAmount = calculateRent(
      rental.platesGiven,
      rental.rentPerPlate,
      totalDays,
    );

    // Update rental
    rental.status = "returned";
    rental.returnDate = today;
    rental.totalAmount = totalAmount;

    await rental.save();

    // ✅ Stock update
    plates.availablePlates += rental.platesGiven;
    plates.rentedPlates -= rental.platesGiven;

    if (plates.rentedPlates < 0) plates.rentedPlates = 0;

    await plates.save();

    res.status(200).json({
      message: "Plates returned successfully",
      success: true,
      totalAmount,
      rental,
    });
  } catch (error) {
    console.log("Error returning plates:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/* =========================
   DELETE RENTAL
========================= */
export const deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    const plates = await Plate.findOne();

    if (!plates) {
      return res.status(500).json({
        success: false,
        message: "Plate inventory not initialized",
      });
    }

    // ✅ Restore stock only if rental is active
    if (rental.status === "active") {
      plates.availablePlates += rental.platesGiven;
      plates.rentedPlates -= rental.platesGiven;

      if (plates.rentedPlates < 0) plates.rentedPlates = 0;
    }

    await plates.save();
    await rental.deleteOne();

    res.status(200).json({
      success: true,
      message: "Rental deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting rental:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
