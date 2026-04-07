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

// 🔹 Stats Card Component
const StatCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border">
    <p className="text-sm text-slate-500">{title}</p>
    <h2 className="text-2xl font-bold text-slate-800">{value}</h2>
  </div>
);

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  // ================= FETCH =================
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${MESSAGE_API}/getAll`, {
        withCredentials: true,
      });
      console.log(res);
      const cleaned = res.data.messages.map((msg) => ({
        _id: msg._id,
        customerName: msg.customer?.customerName || "Unknown",
        phoneNumber: msg.customer?.phoneNumber || "No phone",
        amount: msg.amount || 0,
        message: msg.message || "",
        status: msg.status === "success" ? "sent" : msg.status || "failed",
        createdAt: msg.createdAt,
      }));

      setMessages(cleaned);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const deleteMessage = async (id) => {
    const confirmDelete = window.confirm("Delete this message permanently?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await axios.delete(`${MESSAGE_API}/delete/${id}`, {
        withCredentials: true,
      });

      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  // ================= FILTER =================
  const filteredMessages = useMemo(() => {
    if (filter === "all") return messages;
    return messages.filter((msg) => msg.status === filter);
  }, [messages, filter]);

  // ================= GROUP BY DATE =================
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

  // ================= LOADING =================
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
      </div>
    );

  // ================= EMPTY =================
  if (!messages.length)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-500">
        <h2 className="text-2xl font-semibold">No Messages Found</h2>
        <p className="mt-2">Messages will appear here after sending SMS.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">📩 Messages</h1>
            <p className="text-slate-500 mt-1">Manage and track all messages</p>
          </div>

          {/* FILTER */}
          <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border">
            {["all", "sent", "failed"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition
                ${
                  filter === type
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="Total" value={messages.length} />
          <StatCard
            title="Sent"
            value={messages.filter((m) => m.status === "sent").length}
          />
          <StatCard
            title="Failed"
            value={messages.filter((m) => m.status === "failed").length}
          />
        </div>

        {/* GROUPED */}
        <div className="space-y-8">
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, msgs]) => (
              <div key={date}>
                {/* DATE */}
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="text-indigo-600" />
                  <h2 className="text-xl font-semibold text-slate-700">
                    {date}
                  </h2>
                </div>

                {/* CARDS */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {msgs.map((msg) => (
                    <div
                      key={msg._id}
                      className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-lg transition"
                    >
                      {/* TOP */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-800">
                            {msg.customerName}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {msg.phoneNumber}
                          </p>
                        </div>

                        {/* STATUS */}
                        {msg.status === "sent" ? (
                          <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                            <CheckCircle2 size={14} /> Sent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
                            <XCircle size={14} /> Failed
                          </span>
                        )}
                      </div>

                      {/* MESSAGE */}
                      <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                        {msg.message || "No message content"}
                      </p>

                      {/* FOOTER */}
                      <div className="mt-4 flex justify-between items-center text-sm">
                        <span className="text-xs text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* DELETE */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          disabled={deletingId === msg._id}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                        >
                          {deletingId === msg._id ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
