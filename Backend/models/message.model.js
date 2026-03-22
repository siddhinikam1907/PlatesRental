import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["reminder", "overdue"],
      default: "reminder",
    },

    method: {
      type: String,
      enum: ["WhatsApp"],
      default: "WhatsApp",
    },

    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "failed",
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
