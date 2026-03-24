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
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${CUSTOMER_API}/getAll`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [refresh]);

  // ✅ Filter customers (search feature)
  const filteredCustomers = customers.filter((c) =>
    `${c.customerName} ${c.phoneNumber} ${c.location} ${c.siteLocation}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // ✅ Delete customer
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-700">Customers List</h2>

        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="🔍 Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg outline-none 
          focus:ring-2 focus:ring-indigo-400 w-full sm:w-64"
        />
      </div>

      {/* ✅ Scrollable Table */}
      <div className="overflow-x-auto max-h-[320px] overflow-y-auto border rounded-lg">
        <table className="w-full min-w-[700px] text-left">
          {/* HEADER */}
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium">Location</th>
              <th className="p-3 font-medium">Site</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                <tr
                  key={c._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {c.customerName}
                  </td>

                  <td className="p-3">{c.phoneNumber}</td>

                  <td className="p-3">{c.location}</td>

                  <td className="p-3">{c.siteLocation}</td>

                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteCustomer(c._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
