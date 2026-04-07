import Message from "../models/message.model.js";

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      type: { $ne: "daily-reminder-job" }, // ⭐ hide cron logs
    })
      .populate("customer", "customerName phoneNumber")
      .populate("rental")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
    });
  }
};
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    await Message.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
