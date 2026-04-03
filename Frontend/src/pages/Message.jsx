import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MESSAGE_API } from "../utils/constant";
import {
  CheckCircle2,
  XCircle,
  Search,
  Phone,
  Clock3,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Message() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${MESSAGE_API}/getAll`, {
        withCredentials: true,
      });

      const formattedMessages = [];

      res.data.messages.forEach((msg) => {
        // Summary type contains array in string form
        if (msg.type === "summary") {
          try {
            const parsed = JSON.parse(msg.message);

            parsed.forEach((customer, index) => {
              formattedMessages.push({
                id: `${msg._id}-${index}`,
                name: customer.name,
                phone: customer.phone,
                plates: customer.plates,
                daysUsed: customer.daysUsed,
                amount: customer.amount,
                reminder: customer.status,
                status: msg.status, // sent / failed
                createdAt: msg.createdAt,
              });
            });
          } catch (err) {
            console.log("Unable to parse summary message");
          }
        }

        // Reminder message
        else if (msg.type === "reminder") {
          formattedMessages.push({
            id: msg._id,
            name: msg.customer?.name || "Customer",
            phone: msg.phoneNumber || "-",
            plates: msg.platesGiven || null,
            daysUsed: msg.daysUsed || null,
            amount: msg.amount || null,
            reminder: msg.message,
            status: msg.status,
            createdAt: msg.createdAt,
          });
        }
      });

      // latest first
      formattedMessages.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setMessages(formattedMessages);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesFilter = filter === "all" ? true : msg.status === filter;

      const matchesSearch =
        msg.name?.toLowerCase().includes(search.toLowerCase()) ||
        msg.phone?.includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [messages, filter, search]);

  const stats = {
    total: messages.length,
    sent: messages.filter((m) => m.status === "sent").length,
    failed: messages.filter((m) => m.status === "failed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Message Center</h1>
          <p className="text-gray-500 mt-2">
            View sent and failed reminders for customers
          </p>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <p className="text-gray-500 text-sm">All Messages</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">
              {stats.total}
            </h2>
          </div>

          <div className="bg-green-50 rounded-2xl shadow-sm p-5 border border-green-200">
            <p className="text-green-700 text-sm">Sent</p>
            <h2 className="text-3xl font-bold text-green-700 mt-2">
              {stats.sent}
            </h2>
          </div>

          <div className="bg-red-50 rounded-2xl shadow-sm p-5 border border-red-200">
            <p className="text-red-700 text-sm">Failed</p>
            <h2 className="text-3xl font-bold text-red-700 mt-2">
              {stats.failed}
            </h2>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            {["all", "sent", "failed"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-5 py-2 rounded-xl font-medium transition ${
                  filter === item
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* MESSAGE LIST */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-lg">No messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-2xl border shadow-sm p-5 bg-white hover:shadow-md transition ${
                  msg.status === "sent" ? "border-green-100" : "border-red-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>

                        <div>
                          <h2 className="font-semibold text-lg text-gray-800">
                            {msg.name}
                          </h2>

                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <Phone className="w-4 h-4" />
                            {msg.phone}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          msg.status === "sent"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {msg.status === "sent" ? "Sent" : "Failed"}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      {msg.plates !== null && (
                        <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm">
                          Plates:{" "}
                          <span className="font-semibold">{msg.plates}</span>
                        </div>
                      )}

                      {msg.daysUsed !== null && (
                        <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm">
                          Days:{" "}
                          <span className="font-semibold">{msg.daysUsed}</span>
                        </div>
                      )}

                      {msg.amount !== null && (
                        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold">
                          ₹{msg.amount}
                        </div>
                      )}
                    </div>

                    {/* REMINDER */}
                    <div
                      className={`rounded-xl px-4 py-3 text-sm font-medium ${
                        msg.status === "sent"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {msg.reminder}
                    </div>

                    {/* TIME */}
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
                      <Clock3 className="w-4 h-4" />
                      {new Date(msg.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>

                  {/* RIGHT ICON */}
                  <div className="flex items-center justify-center">
                    {msg.status === "sent" ? (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle2 className="w-7 h-7" />
                        Sent
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <XCircle className="w-7 h-7" />
                        Failed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
