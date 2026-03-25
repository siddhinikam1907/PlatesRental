import Plate from "../models/plate.model.js";

/* ---------------- GET ---------------- */
export const getPlateStock = async (req, res) => {
  try {
    const plates = await Plate.findOne();

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
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/* ---------------- CREATE ---------------- */
export const setPlateStock = async (req, res) => {
  try {
    let { totalPlates, rentPerPlate } = req.body;

    totalPlates = Number(totalPlates);
    rentPerPlate = Number(rentPerPlate);

    if (isNaN(totalPlates) || isNaN(rentPerPlate)) {
      return res.status(400).json({
        message: "Invalid numeric values",
        success: false,
      });
    }

    const existing = await Plate.findOne();

    if (existing) {
      return res.status(400).json({
        message: "Plate inventory already exists",
        success: false,
      });
    }

    const plates = await Plate.create({
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
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

/* ---------------- UPDATE ---------------- */
export const updatePlateStock = async (req, res) => {
  try {
    let { addPlates, rentPerPlate } = req.body;

    const plates = await Plate.findOne();

    if (!plates) {
      return res.status(404).json({
        message: "Plate inventory not found",
        success: false,
      });
    }

    /* -------- ADD PLATES (INCREMENT LOGIC) -------- */
    if (addPlates !== undefined) {
      addPlates = Number(addPlates);

      if (isNaN(addPlates) || addPlates < 0) {
        return res.status(400).json({
          message: "Invalid addPlates value",
          success: false,
        });
      }

      plates.totalPlates += addPlates;
      plates.availablePlates += addPlates;
    }

    /* -------- UPDATE RENT -------- */
    if (rentPerPlate !== undefined) {
      rentPerPlate = Number(rentPerPlate);

      if (isNaN(rentPerPlate)) {
        return res.status(400).json({
          message: "Invalid rentPerPlate",
          success: false,
        });
      }

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
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
