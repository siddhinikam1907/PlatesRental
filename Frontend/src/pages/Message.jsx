import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MESSAGE_API } from "../utils/constant";
import { CheckCircle2, XCircle, Search, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function Message() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${MESSAGE_API}/getAll`, {
        withCredentials: true,
      });

      const normalized = [];

      res.data.messages.forEach((msg) => {
        // summary type => multiple customers in one message
        if (msg.type === "summary") {
          try {
            const customers = JSON.parse(msg.message);

            customers.forEach((customer, index) => {
              normalized.push({
                id: `${msg._id}-${index}`,
                name: customer.name,
                phone: customer.phone,
                plates: customer.plates,
                amount: customer.amount,
                daysUsed: customer.daysUsed,
                reminder: customer.status,
                status: msg.status, // sent / failed
                date: new Date(msg.createdAt),
              });
            });
          } catch (err) {
            console.log("Unable to parse summary");
          }
        }

        // reminder type => single customer
        else if (msg.type === "reminder") {
          normalized.push({
            id: msg._id,
            name: msg.customer?.name || "Customer",
            phone: msg.phoneNumber || "-",
            plates: msg.platesGiven || "-",
            amount: msg.amount || "-",
            daysUsed: msg.daysUsed || "-",
            reminder: msg.message,
            status: msg.status,
            date: new Date(msg.createdAt),
          });
        }
      });

      setMessages(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const statusMatch = filter === "all" ? true : msg.status === filter;

      const searchMatch =
        msg.name.toLowerCase().includes(search.toLowerCase()) ||
        msg.phone.includes(search);

      return statusMatch && searchMatch;
    });
  }, [messages, filter, search]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};

    filteredMessages.forEach((msg) => {
      const dateKey = msg.date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      if (!groups[dateKey]) groups[dateKey] = [];

      groups[dateKey].push(msg);
    });

    return groups;
  }, [filteredMessages]);

  const totalSent = messages.filter((m) => m.status === "sent").length;
  const totalFailed = messages.filter((m) => m.status === "failed").length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Message History</h1>
          <p className="text-slate-500 mt-2">
            Customers whose due / overdue reminder was sent to admin
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <p className="text-slate-500 text-sm">All Messages</p>
            <h2 className="text-3xl font-bold mt-2">{messages.length}</h2>
          </div>

          <div className="bg-green-50 rounded-2xl p-5 shadow-sm border border-green-200">
            <p className="text-green-700 text-sm">Sent</p>
            <h2 className="text-3xl font-bold mt-2 text-green-700">
              {totalSent}
            </h2>
          </div>

          <div className="bg-red-50 rounded-2xl p-5 shadow-sm border border-red-200">
            <p className="text-red-700 text-sm">Failed</p>
            <h2 className="text-3xl font-bold mt-2 text-red-700">
              {totalFailed}
            </h2>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="absolute top-3 left-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            {["all", "sent", "failed"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-5 py-2 rounded-xl font-medium transition ${
                  filter === item
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped Tables by Date */}
        <div className="space-y-8">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border shadow-sm text-slate-500">
              No messages found
            </div>
          ) : (
            Object.entries(groupedMessages)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, customers]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-sm border overflow-hidden"
                >
                  {/* Date Header */}
                  <div className="flex items-center gap-3 px-6 py-4 bg-slate-100 border-b">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-800">
                      {date}
                    </h2>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr className="text-slate-600 text-sm">
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Phone</th>
                          <th className="px-6 py-4">Plates</th>
                          <th className="px-6 py-4">Days Used</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Reminder</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {customers.map((msg, idx) => (
                          <tr
                            key={msg.id}
                            className={`border-b last:border-0 hover:bg-slate-50 transition ${
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                            }`}
                          >
                            <td className="px-6 py-4 font-medium text-slate-800">
                              {msg.name}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {msg.phone}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {msg.plates}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {msg.daysUsed}
                            </td>

                            <td className="px-6 py-4 font-semibold text-emerald-600">
                              ₹{msg.amount}
                            </td>

                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
                                {msg.reminder}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              {msg.status === "sent" ? (
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                  <CheckCircle2 className="w-5 h-5" />
                                  Sent
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-red-600 font-medium">
                                  <XCircle className="w-5 h-5" />
                                  Failed
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
