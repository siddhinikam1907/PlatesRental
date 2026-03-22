import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    platesGiven: {
      type: Number,
      required: true,
    },

    rentPerPlate: {
      type: Number,
      required: true,
    },

    // how many days customer plans to keep plates
    expectedDays: {
      type: Number,
      required: true,
    },

    // calculated deadline
    expectedReturnDate: {
      type: Date,
    },

    totalAmount: {
      type: Number,
    },

    rentDate: {
      type: Date,
      default: Date.now,
    },

    returnDate: {
      type: Date,
    },

    lastReminderSent: {
      type: Date,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "returned"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Rental", rentalSchema);
