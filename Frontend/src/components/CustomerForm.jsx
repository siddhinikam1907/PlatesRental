import { useEffect, useState } from "react";
import axios from "axios";
import { CUSTOMER_API } from "../utils/constant";
import { toast } from "sonner";

export default function CustomerForm({ reload, selectedCustomer }) {
  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    location: "",
    siteLocation: "",
  });

  useEffect(() => {
    if (selectedCustomer) {
      setForm(selectedCustomer);
    }
  }, [selectedCustomer]);

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (selectedCustomer) {
        const res = await axios.put(
          `${CUSTOMER_API}/${selectedCustomer._id}`,
          form,
          { withCredentials: true },
        );

        if (res.data.success) {
          toast.success("Customer updated");
          reload();
        }
      } else {
        const res = await axios.post(`${CUSTOMER_API}/create`, form, {
          withCredentials: true,
        });

        if (res.data.success) {
          toast.success(res.data.message);
          reload();
        }
      }

      setForm({
        customerName: "",
        phoneNumber: "",
        location: "",
        siteLocation: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {selectedCustomer ? "Update Customer" : "Add Customer"}
      </h2>

      <form
        onSubmit={submitHandler}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={form.customerName}
          onChange={changeHandler}
          className="border p-2 rounded-lg"
        />

        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={changeHandler}
          className="border p-2 rounded-lg"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={changeHandler}
          className="border p-2 rounded-lg"
        />

        <input
          type="text"
          name="siteLocation"
          placeholder="Site Location"
          value={form.siteLocation}
          onChange={changeHandler}
          className="border p-2 rounded-lg"
        />

        <button className="bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 md:col-span-4">
          {selectedCustomer ? "Update Customer" : "Add Customer"}
        </button>
      </form>
    </div>
  );
}
