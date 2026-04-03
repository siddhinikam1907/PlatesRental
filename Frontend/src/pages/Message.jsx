import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MESSAGE_API } from "../utils/constant";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  // ================= FETCH MESSAGES =================
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${MESSAGE_API}/getAll`, {
        withCredentials: true,
      });

      // ✅ Corrected field names according to backend
      const cleaned = res.data.messages.map((msg) => ({
        _id: msg._id,
        customerName: msg.customer?.customerName || "Unknown Customer",
        phoneNumber: msg.customer?.phoneNumber || "No phone",
        amount: msg.amount || 0,
        status: msg.status || "failed",
        createdAt: msg.createdAt,
      }));

      setMessages(cleaned);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE MESSAGE =================
  const deleteMessage = async (id) => {
    const confirmDelete = window.confirm("Delete this message permanently?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await axios.delete(`${MESSAGE_API}/${id}`, {
        withCredentials: true,
      });

      // Instant UI update
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  // ================= FILTERED MESSAGES =================
  const filteredMessages = useMemo(() => {
    if (filter === "all") return messages;
    return messages.filter((msg) => msg.status === filter);
  }, [messages, filter]);

  // ================= GROUPED BY DATE =================
  const groupedByDate = useMemo(() => {
    return filteredMessages.reduce((acc, msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {});
  }, [filteredMessages]);

  // ================= LOADING STATE =================
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
      </div>
    );

  // ================= EMPTY STATE =================
  if (!messages.length)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-500">
        <h2 className="text-2xl font-semibold">No Messages Found</h2>
        <p className="mt-2">Messages will appear here after sending SMS.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Messages</h1>
            <p className="text-slate-500 mt-2">Grouped by date</p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex gap-3">
            {["all", "sent", "failed"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl font-medium transition capitalize
                ${
                  filter === type
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-700 border hover:bg-slate-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* GROUPED TABLES */}
        <div className="space-y-8">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, msgs]) => (
              <div
                key={date}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
              >
                {/* DATE HEADER */}
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-semibold">{date}</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 text-left">
                      <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {msgs.map((msg, i) => (
                        <tr
                          key={msg._id}
                          className={`border-t ${
                            i % 2 ? "bg-slate-50" : "bg-white"
                          } hover:bg-indigo-50`}
                        >
                          <td className="px-6 py-4 font-medium">
                            {msg.customerName}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {msg.phoneNumber}
                          </td>

                          <td className="px-6 py-4 font-semibold text-emerald-600">
                            ₹{msg.amount}
                          </td>

                          <td className="px-6 py-4">
                            {msg.status === "sent" ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700">
                                <CheckCircle2 className="w-4 h-4" /> Sent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700">
                                <XCircle className="w-4 h-4" /> Failed
                              </span>
                            )}
                          </td>

                          {/* DELETE BUTTON */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => deleteMessage(msg._id)}
                              disabled={deletingId === msg._id}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                            >
                              {deletingId === msg._id ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
