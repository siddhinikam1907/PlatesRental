import mongoose from "mongoose";

const plateSchema = new mongoose.Schema(
  {
    totalPlates: {
      type: Number,
      required: true,
      default: 100,
    },

    availablePlates: {
      type: Number,
      required: true,
      default: 0,
    },

    rentPerPlate: {
      type: Number,
      required: true,
      default: 2, // default rate per plate
    },
  },
  { timestamps: true },
);

const Plate = mongoose.model("Plate", plateSchema);

export default Plate;
