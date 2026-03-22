import { useEffect, useState } from "react";
import axios from "axios";
import { MESSAGE_API } from "../utils/constant";
import { toast } from "sonner";

export default function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${MESSAGE_API}/getAll`, {
        withCredentials: true,
      });
      setMessages(res.data.messages);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch messages");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  // ✅ Delete message
  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    try {
      const res = await axios.delete(`${MESSAGE_API}/delete/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Message deleted");
        fetchMessages(); // Refresh the list
      } else {
        toast.error("Failed to delete message");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error deleting message");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📩 Admin WhatsApp Alerts</h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {messages.map((msg) => (
              <tr
                key={msg._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium">
                  {msg.customer?.customerName || "Deleted"}
                </td>

                <td className="p-3 flex items-center gap-2">
                  <a
                    href={`tel:+91${msg.phoneNumber}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {msg.phoneNumber}
                  </a>
                  <button
                    onClick={() => copyToClipboard(msg.phoneNumber)}
                    className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      msg.type === "overdue" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    {msg.type}
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      msg.status === "sent" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {msg.status}
                  </span>
                </td>

                <td className="p-3">{new Date(msg.sentAt).toLocaleString()}</td>

                {/* ✅ DELETE BUTTON */}
                <td className="p-3">
                  <button
                    onClick={() => deleteMessage(msg._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {messages.length === 0 && (
          <div className="text-center p-6 text-gray-500">No messages yet</div>
        )}
      </div>
    </div>
  );
}
