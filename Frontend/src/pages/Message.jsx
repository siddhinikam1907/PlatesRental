import { useEffect, useState } from "react";
import axios from "axios";
import { MESSAGE_API } from "../utils/constant";
import {
  Mail,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Message() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${MESSAGE_API}/getAll`, {
          withCredentials: true,
        });

        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter =
      filter === "all" ||
      msg.status === filter ||
      msg.method.toLowerCase() === filter;

    const matchesSearch =
      msg.message.toLowerCase().includes(search.toLowerCase()) ||
      msg.customer?.name?.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            📩 Message Center
          </h1>
          <p className="text-gray-500 mt-1">
            Track reminders, overdue alerts and email summaries
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customer or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        {["all", "sent", "failed", "whatsapp", "email"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              filter === item
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {/* MESSAGE LIST */}
      <div className="grid gap-5">
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-md">
            <Clock3 className="mx-auto w-10 h-10 text-gray-400 mb-3" />
            <p className="text-gray-500 text-lg">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
            >
              {/* LEFT SECTION */}
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl ${
                    msg.method === "WhatsApp"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {msg.method === "WhatsApp" ? (
                    <MessageCircle className="w-6 h-6" />
                  ) : (
                    <Mail className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {msg.customer?.name || "System Notification"}
                    </h2>

                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        msg.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {msg.status}
                    </span>

                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {msg.type}
                    </span>
                  </div>

                  <p className="text-gray-600 max-w-2xl leading-relaxed">
                    {msg.message}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span>
                      {msg.method === "WhatsApp"
                        ? `📱 ${msg.phoneNumber || "No number"}`
                        : "📧 Email"}
                    </span>

                    <span>
                      🕒{" "}
                      {new Date(msg.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT STATUS ICON */}
              <div className="flex items-center justify-end">
                {msg.status === "sent" ? (
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle2 className="w-6 h-6" />
                    Delivered
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <XCircle className="w-6 h-6" />
                    Failed
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
