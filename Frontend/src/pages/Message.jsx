import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MESSAGE_API } from "../utils/constant";
import {
  Mail,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Message() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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
      console.error(err);
    }
  };

  const stats = useMemo(() => {
    return {
      total: messages.length,
      sent: messages.filter((m) => m.status === "sent").length,
      failed: messages.filter((m) => m.status === "failed").length,
      whatsapp: messages.filter((m) => m.method?.toLowerCase() === "whatsapp")
        .length,
      email: messages.filter((m) => m.method?.toLowerCase() === "email").length,
    };
  }, [messages]);

  const filteredMessages = messages.filter((m) => {
    const method = m.method?.toLowerCase() || "";
    const status = m.status?.toLowerCase() || "";

    const searchMatch =
      m.message?.toLowerCase().includes(search.toLowerCase()) ||
      m.customer?.name?.toLowerCase().includes(search.toLowerCase());

    const filterMatch =
      filter === "all" || status === filter || method === filter;

    return searchMatch && filterMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-lg border border-white rounded-3xl p-6 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Message Center
                </h1>
                <p className="text-gray-500 mt-2">
                  Monitor all email and WhatsApp reminders in one place
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-3 w-72 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <TopCard
            title="Total"
            value={stats.total}
            color="from-slate-500 to-slate-700"
          />
          <TopCard
            title="Sent"
            value={stats.sent}
            color="from-green-500 to-emerald-600"
          />
          <TopCard
            title="Failed"
            value={stats.failed}
            color="from-red-500 to-pink-600"
          />
          <TopCard
            title="WhatsApp"
            value={stats.whatsapp}
            color="from-green-400 to-green-600"
          />
          <TopCard
            title="Email"
            value={stats.email}
            color="from-blue-500 to-indigo-600"
          />
        </div>

        {/* MESSAGE LIST */}
        <div className="space-y-5">
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <Clock3 className="mx-auto text-gray-400 w-12 h-12 mb-3" />
              <p className="text-gray-500 text-lg">No messages found</p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              let parsedSummary = null;

              try {
                if (msg.type === "summary" && typeof msg.message === "string") {
                  parsedSummary = JSON.parse(msg.message);
                }
              } catch (err) {}

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`rounded-3xl p-6 shadow-lg border transition-all ${
                    msg.status === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-white/90 border-gray-100"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                    {/* LEFT */}
                    <div className="flex gap-4 flex-1">
                      <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-md ${
                          msg.method?.toLowerCase() === "whatsapp"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {msg.method?.toLowerCase() === "whatsapp" ? (
                          <MessageCircle className="w-7 h-7" />
                        ) : (
                          <Mail className="w-7 h-7" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h2 className="text-xl font-semibold text-gray-800">
                            {msg.customer?.name || "System Notification"}
                          </h2>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              msg.status === "sent"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {msg.status}
                          </span>

                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {msg.method}
                          </span>

                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            {msg.type}
                          </span>
                        </div>

                        {/* NORMAL MESSAGE */}
                        {!parsedSummary && (
                          <div className="bg-gray-50 rounded-2xl p-4 text-gray-700 leading-7 border border-gray-100">
                            {msg.message}
                          </div>
                        )}

                        {/* SUMMARY MESSAGE */}
                        {parsedSummary && (
                          <div className="grid md:grid-cols-2 gap-4">
                            {parsedSummary.map((person, idx) => (
                              <div
                                key={idx}
                                className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-bold text-gray-800">
                                    {person.name}
                                  </h3>
                                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                    {person.status}
                                  </span>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600">
                                  <p>📞 {person.phone}</p>
                                  <p>🍽 {person.plates} plates</p>
                                  <p>📅 {person.daysUsed} days used</p>
                                  <p className="font-semibold text-green-700">
                                    ₹{person.amount}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">
                          <span>
                            {new Date(msg.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>

                          {msg.phoneNumber && <span>📱 {msg.phoneNumber}</span>}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT STATUS */}
                    <div className="flex items-center">
                      {msg.status === "sent" ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
                          <CheckCircle2 className="w-6 h-6" />
                          Delivered
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
                          <XCircle className="w-6 h-6" />
                          Failed
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function TopCard({ title, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className={`bg-gradient-to-r ${color} rounded-3xl p-5 text-white shadow-lg`}
    >
      <p className="text-sm opacity-80">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </motion.div>
  );
}
