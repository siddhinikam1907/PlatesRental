import { calculateRent } from "../utils/calculateRent";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  CUSTOMER_API,
  RENTAL_API,
  PLATE_API,
  MESSAGE_API,
} from "../utils/constant";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [customers, setCustomers] = useState(0);
  const [activeRentals, setActiveRentals] = useState(0);
  const [plates, setPlates] = useState({});
  const [rentedPlates, setRentedPlates] = useState(0);
  const [liveMoney, setLiveMoney] = useState(0);
  const [failedMessages, setFailedMessages] = useState(0);
  const [sentMessages, setSentMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [customerRes, rentalRes, plateRes, messageRes] =
          await Promise.all([
            axios.get(`${CUSTOMER_API}/getAll`, { withCredentials: true }),
            axios.get(`${RENTAL_API}/getAll`, { withCredentials: true }),
            axios.get(`${PLATE_API}/getAll`, { withCredentials: true }),
            axios.get(`${MESSAGE_API}/getAll`, { withCredentials: true }),
          ]);

        const allRentals = rentalRes.data.rentals;
        const active = allRentals.filter((r) => r.status === "active");

        setCustomers(customerRes.data.customers.length);
        setActiveRentals(active.length);
        setPlates(plateRes.data.plates);

        const totalRented = active.reduce((sum, r) => sum + r.platesGiven, 0);
        setRentedPlates(totalRented);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalMoney = active.reduce((sum, rental) => {
          const rentDate = new Date(rental.rentDate);
          rentDate.setHours(0, 0, 0, 0);

          const daysUsed = Math.max(
            1,
            Math.floor((today - rentDate) / (1000 * 60 * 60 * 24)) + 1,
          );

          const amount = calculateRent(
            Number(rental.platesGiven),
            Number(rental.rentPerPlate),
            daysUsed,
          );

          return sum + amount;
        }, 0);

        setLiveMoney(totalMoney);

        const messages = messageRes.data.messages;
        setFailedMessages(messages.filter((m) => m.status === "failed").length);
        setSentMessages(messages.filter((m) => m.status === "sent").length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // 🔄 Loader UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-gray-800"
      >
        📊 Rental Business Dashboard
      </motion.h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card title="Customers" value={customers} color="bg-blue-500" />
        <Card
          title="Active Rentals"
          value={activeRentals}
          color="bg-green-500"
        />
        <Card
          title="Available Plates"
          value={plates.availablePlates ?? 0}
          color="bg-purple-500"
        />
        <Card
          title="Rented Plates"
          value={rentedPlates}
          color="bg-orange-500"
        />
        <Card title="Sent Alerts" value={sentMessages} color="bg-indigo-500" />
        <Card title="Failed Alerts" value={failedMessages} color="bg-red-500" />
      </div>

      {/* LIVE MONEY CARD */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-xl"
      >
        <h3 className="text-lg">💰 Live Rental Amount</h3>
        <p className="text-4xl font-bold mt-2">₹{liveMoney}</p>
      </motion.div>

      {/* PLATE OVERVIEW */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">📦 Plate Inventory</h2>

        <div className="grid grid-cols-3 gap-6 text-center">
          <InventoryCard label="Total Plates" value={plates.totalPlates ?? 0} />
          <InventoryCard
            label="Available"
            value={plates.availablePlates ?? 0}
            color="text-green-600"
          />
          <InventoryCard
            label="Rent / Plate"
            value={`₹${plates.rentPerPlate ?? 0}`}
            color="text-blue-600"
          />
        </div>
      </motion.div>
    </div>
  );
}

/* CARD COMPONENT */
function Card({ title, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.07 }}
      className={`${color} text-white p-6 rounded-2xl shadow-lg cursor-pointer`}
    >
      <h3 className="text-sm opacity-80">{title}</h3>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </motion.div>
  );
}

/* INVENTORY CARD */
function InventoryCard({ label, value, color = "text-gray-800" }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-50 p-4 rounded-xl shadow-sm"
    >
      <p className="text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}
