import { useEffect, useState } from "react";
import axios from "axios";
import QRScan from "../components/QRScan";
import {
  CUSTOMER_API,
  RENTAL_API,
  PLATE_API,
  MESSAGE_API,
} from "../utils/constant";

export default function Dashboard() {
  const [customers, setCustomers] = useState(0);
  const [activeRentals, setActiveRentals] = useState(0);
  const [plates, setPlates] = useState({});
  const [rentedPlates, setRentedPlates] = useState(0);
  const [liveMoney, setLiveMoney] = useState(0);
  const [failedMessages, setFailedMessages] = useState(0);
  const [sentMessages, setSentMessages] = useState(0);

  // WhatsApp QR scan state
  const [whatsappReady, setWhatsappReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        // ✅ Total Rented Plates
        const totalRented = active.reduce((sum, r) => sum + r.platesGiven, 0);
        setRentedPlates(totalRented);

        // ✅ Live Rental Amount
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalMoney = active.reduce((sum, rental) => {
          const rentDate = new Date(rental.rentDate);
          rentDate.setHours(0, 0, 0, 0);

          const daysUsed = Math.max(
            1,
            Math.floor((today - rentDate) / (1000 * 60 * 60 * 24)) + 1,
          );

          return sum + rental.platesGiven * rental.rentPerPlate * daysUsed;
        }, 0);
        setLiveMoney(totalMoney);

        // ✅ Message stats
        const messages = messageRes.data.messages;
        setFailedMessages(messages.filter((m) => m.status === "failed").length);
        setSentMessages(messages.filter((m) => m.status === "sent").length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Rental Business Dashboard
      </h1>

      {/* QR Scan */}
      {!whatsappReady && (
        <div className="bg-gray-100 p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-2">Scan QR to initialize WhatsApp</h2>
          <QRScan setWhatsappReady={setWhatsappReady} />
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card title="Total Customers" value={customers} color="bg-blue-500" />
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
        <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg">Live Rental Amount</h3>
          <p className="text-3xl font-bold mt-2">₹{liveMoney}</p>
        </div>
      </div>

      {/* PLATE OVERVIEW */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Plate Inventory</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-gray-500">Total Plates</p>
            <p className="text-2xl font-bold">{plates.totalPlates ?? 0}</p>
          </div>
          <div>
            <p className="text-gray-500">Available Plates</p>
            <p className="text-2xl font-bold text-green-600">
              {plates.availablePlates ?? 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Rent Per Plate</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{plates.rentPerPlate ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-xl shadow-lg`}>
      <h3 className="text-lg">{title}</h3>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}
