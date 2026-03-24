import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false, // ✅ not required for email summary
    },

    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: false, // ✅ not required
    },

    phoneNumber: {
      type: String,
      required: false, // ✅ not needed for email
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["reminder", "overdue", "summary"], // ✅ added summary
      default: "reminder",
    },

    method: {
      type: String,
      enum: ["WhatsApp", "Email"], // ✅ added Email
      default: "WhatsApp",
    },

    status: {
      type: String,
      enum: ["sent", "failed"],
      default: "failed",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
