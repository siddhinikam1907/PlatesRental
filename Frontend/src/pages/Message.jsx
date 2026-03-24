import React, { useEffect, useState } from "react";
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

      setMessages(res.data.messages || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch messages");
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      const res = await axios.delete(`${MESSAGE_API}/delete/${id}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("Message deleted");
        fetchMessages();
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
      <h1 className="text-3xl font-bold mb-6">
        📩 Admin Alerts (Email Reports)
      </h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        {/* ✅ Horizontal Scroll Wrapper */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {messages.map((msg) => {
                let parsedData = [];

                if (msg.type === "summary" && msg.message) {
                  try {
                    parsedData = JSON.parse(msg.message);
                  } catch {
                    parsedData = [];
                  }
                }

                return (
                  <React.Fragment key={msg._id}>
                    {/* MAIN ROW */}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-white text-sm ${
                            msg.type === "summary"
                              ? "bg-purple-500"
                              : msg.type === "overdue"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {msg.type}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-white text-sm ${
                            msg.method === "Email"
                              ? "bg-indigo-500"
                              : "bg-green-500"
                          }`}
                        >
                          {msg.method}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-white text-sm ${
                            msg.status === "sent"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>

                      <td className="p-3">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleString()
                          : "No Date"}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* SUMMARY TABLE */}
                    {msg.type === "summary" && parsedData.length > 0 && (
                      <tr>
                        <td colSpan="5" className="p-4 bg-gray-50">
                          {/* ✅ Nested scroll for summary table */}
                          <div className="overflow-x-auto">
                            <table className="min-w-[700px] w-full border text-sm">
                              <thead className="bg-gray-200">
                                <tr>
                                  <th className="p-2">Customer</th>
                                  <th className="p-2">Phone</th>
                                  <th className="p-2">Plates</th>
                                  <th className="p-2">Days Used</th>
                                  <th className="p-2">Status</th>
                                  <th className="p-2">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {parsedData.map((item, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2">{item.phone}</td>
                                    <td className="p-2">{item.plates}</td>
                                    <td className="p-2">{item.daysUsed}</td>
                                    <td className="p-2">{item.status}</td>
                                    <td className="p-2 font-semibold text-green-600">
                                      ₹{item.amount}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {messages.length === 0 && (
          <div className="text-center p-6 text-gray-500">No messages yet</div>
        )}
      </div>
    </div>
  );
}
