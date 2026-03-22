import { useEffect, useState } from "react";
import axios from "axios";
import RentalForm from "../components/RentalForm";
import RentalTable from "../components/RentalTable";
import { CUSTOMER_API, RENTAL_API } from "../utils/constant";

export default function Rentals() {
  const [customers, setCustomers] = useState([]);
  const [rentals, setRentals] = useState([]);

  const fetchCustomers = async () => {
    const res = await axios.get(`${CUSTOMER_API}/getAll`, {
      withCredentials: true,
    });
    if (res.data.success) setCustomers(res.data.customers);
  };

  const fetchRentals = async () => {
    const res = await axios.get(`${RENTAL_API}/getAll`, {
      withCredentials: true,
    });
    if (res.data.success) setRentals(res.data.rentals);
  };

  useEffect(() => {
    fetchCustomers();
    fetchRentals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Rentals Management</h1>

      <RentalForm customers={customers} refreshRentals={fetchRentals} />

      <RentalTable rentals={rentals} refreshRentals={fetchRentals} />
    </div>
  );
}
