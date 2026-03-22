import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PLATE_API } from "../utils/constant.js";

export default function PlateStock() {
  const [plates, setPlates] = useState(null);
  const [totalPlates, setTotalPlates] = useState("");
  const [rentPerPlate, setRentPerPlate] = useState("");

  const fetchPlateStock = async () => {
    try {
      const res = await axios.get(`${PLATE_API}/getAll`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setPlates(res.data.plates);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPlateStock();
  }, []);

  const createStock = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${PLATE_API}/set-stock`,
        {
          totalPlates,
          rentPerPlate,
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Plate inventory created");
        fetchPlateStock();
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const updateStock = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${PLATE_API}/update`,
        {
          totalPlates,
          rentPerPlate,
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Plate inventory updated");
        fetchPlateStock();
      }
    } catch (error) {
      toast.error("Error updating stock");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Plate Inventory Management
      </h1>

      {/* Stock Display */}
      {plates && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Plates</p>
            <h2 className="text-2xl font-bold">{plates.totalPlates}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Available Plates</p>
            <h2 className="text-2xl font-bold text-green-600">
              {plates.availablePlates}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Rent Per Plate</p>
            <h2 className="text-2xl font-bold text-blue-600">
              ₹{plates.rentPerPlate}
            </h2>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {plates ? "Update Plate Stock" : "Set Plate Stock"}
        </h2>

        <form
          onSubmit={plates ? updateStock : createStock}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="number"
            placeholder="Total Plates"
            value={totalPlates}
            onChange={(e) => setTotalPlates(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <input
            type="number"
            placeholder="Rent Per Plate"
            value={rentPerPlate}
            onChange={(e) => setRentPerPlate(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <button className="bg-indigo-500 text-white rounded-lg py-2 hover:bg-indigo-600 transition">
            {plates ? "Update Stock" : "Create Stock"}
          </button>
        </form>
      </div>
    </div>
  );
}
