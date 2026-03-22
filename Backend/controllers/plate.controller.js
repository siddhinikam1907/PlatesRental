import Plate from "../models/plate.model.js";

export const getPlateStock = async (req, res) => {
  try {
    const plates = await Plate.findOne(); // only one record
    if (!plates) {
      return res.status(404).json({
        message: "Plate inventory not found",
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      plates,
    });
  } catch (error) {
    console.log("Error fetching plates:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const setPlateStock = async (req, res) => {
  try {
    const { totalPlates, rentPerPlate } = req.body;
    if (totalPlates == null || rentPerPlate == null) {
      return res.status(400).json({
        message: "totalPlates and rentPerPlate are required",
        success: false,
      });
    }

    let plates = await Plate.findOne();
    if (plates) {
      return res.status(400).json({
        message: "Plate inventory already exists, use update instead",
        success: false,
      });
    }

    plates = await Plate.create({
      totalPlates,
      availablePlates: totalPlates,
      rentedPlates: 0,
      rentPerPlate,
    });

    res.status(201).json({
      message: "Plate inventory created successfully",
      success: true,
      plates,
    });
  } catch (error) {
    console.log("Error setting plate stock:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updatePlateStock = async (req, res) => {
  try {
    const { totalPlates, rentPerPlate } = req.body;

    const plates = await Plate.findOne();
    if (!plates) {
      return res.status(404).json({
        message: "Plate inventory not found",
        success: false,
      });
    }

    // Only update totals if provided
    if (totalPlates != null) {
      // if new total is less than already rented, block update
      if (totalPlates < plates.rentedPlates) {
        return res.status(400).json({
          message: "Total plates cannot be less than already rented plates",
          success: false,
        });
      }

      plates.totalPlates = totalPlates;

      // update available based on true rented count
      plates.availablePlates = totalPlates - plates.rentedPlates;
    }

    if (rentPerPlate != null) {
      plates.rentPerPlate = rentPerPlate;
    }

    await plates.save();

    res.status(200).json({
      message: "Plate inventory updated successfully",
      success: true,
      plates,
    });
  } catch (error) {
    console.log("Error updating plate stock:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};
