import { useState } from "react";
import axios from "axios";
import { RENTAL_API } from "../utils/constant";
import { toast } from "sonner";

export default function RentalForm({ customers, refreshRentals }) {
  const [customerId, setCustomerId] = useState("");
  const [platesGiven, setPlatesGiven] = useState("");
  const [expectedDays, setExpectedDays] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${RENTAL_API}/create`,
        {
          customerId,
          platesGiven: Number(platesGiven),
          expectedDays: Number(expectedDays),
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Rental created successfully");
        setPlatesGiven("");
        setExpectedDays("");
        refreshRentals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating rental");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Rental</h2>
      <form
        onSubmit={submitHandler}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <select
          className="border p-2 rounded-lg"
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option>Select Customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.customerName}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Plates Given"
          value={platesGiven}
          onChange={(e) => setPlatesGiven(e.target.value)}
          className="border p-2 rounded-lg"
        />
        <input
          type="number"
          placeholder="Expected Days"
          value={expectedDays}
          onChange={(e) => setExpectedDays(e.target.value)}
          className="border p-2 rounded-lg"
        />
        <button className="bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition">
          Create Rental
        </button>
      </form>
    </div>
  );
}
