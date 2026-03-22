import axios from "axios";
import { RENTAL_API } from "../utils/constant";
import { toast } from "sonner";

export default function RentalTable({ rentals, refreshRentals }) {
  // Return plates
  const returnPlates = async (id) => {
    try {
      const res = await axios.put(
        `${RENTAL_API}/return/${id}`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(`Total Rent: ₹${res.data.totalAmount}`);
        refreshRentals();
      }
    } catch (error) {
      toast.error("Error returning plates");
    }
  };

  // Delete rental
  const deleteRental = async (id) => {
    try {
      const res = await axios.delete(`${RENTAL_API}/delete/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success("Rental deleted successfully");
        refreshRentals();
      }
    } catch (error) {
      toast.error("Error deleting rental");
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Rentals List</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Plates</th>
              <th className="p-3">Rent Date</th>
              <th className="p-3">Expected Return</th>
              <th className="p-3">Days Used</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Deadline</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((r) => (
              <tr
                key={r._id}
                className={`border-b hover:bg-gray-50 ${
                  r.deadlineStatus?.includes("Overdue") ? "bg-red-50" : ""
                }`}
              >
                <td className="p-3 font-medium">{r.customer?.customerName}</td>
                <td className="p-3">{r.platesGiven}</td>
                <td className="p-3">{formatDate(r.rentDate)}</td>
                <td className="p-3">{formatDate(r.expectedReturnDate)}</td>
                <td className="p-3">{r.daysUsed}</td>
                <td className="p-3 font-semibold text-green-700">
                  ₹{r.currentAmount}
                </td>
                <td className="p-3">
                  <span
                    className={`text-sm font-medium ${
                      r.deadlineStatus?.includes("Overdue")
                        ? "text-red-600"
                        : r.deadlineStatus === "Return Today"
                        ? "text-orange-500"
                        : "text-green-600"
                    }`}
                  >
                    {r.deadlineStatus}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      r.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  {r.status === "active" && (
                    <button
                      onClick={() => returnPlates(r._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                    >
                      Return
                    </button>
                  )}
                  <button
                    onClick={() => deleteRental(r._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
