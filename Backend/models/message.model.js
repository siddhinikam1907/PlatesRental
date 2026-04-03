import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },

    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: false,
    },

    phoneNumber: {
      type: String,
      required: false,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["reminder", "overdue", "summary", "daily-reminder-job"],
      default: "reminder",
    },

    method: {
      type: String,
      enum: ["WhatsApp", "Email"],
      default: "Email",
    },

    status: {
      type: String,
      enum: ["sent", "failed", "success"],
      default: "failed",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
