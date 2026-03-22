import { useEffect, useState } from "react";
import axios from "axios";
import { CUSTOMER_API } from "../utils/constant";
import { toast } from "sonner";

export default function CustomerTable({
  refresh,
  reload,
  setSelectedCustomer,
}) {
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${CUSTOMER_API}/getAll`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [refresh]);
  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      const res = await axios.delete(`${CUSTOMER_API}/${id}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        reload();
      }
    } catch (error) {
      toast.error("Error deleting customer");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Customers List</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Location</th>
              <th className="p-3">Site</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{c.customerName}</td>
                <td className="p-3">{c.phoneNumber}</td>
                <td className="p-3">{c.location}</td>
                <td className="p-3">{c.siteLocation}</td>

                <td className="p-3 space-x-2">
                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="bg-yellow-400 px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteCustomer(c._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
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
