import { useState } from "react";
import CustomerForm from "../components/CustomerForm";
import CustomerTable from "../components/CustomerTable";

export default function Customers() {
  const [refresh, setRefresh] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const reload = () => {
    setRefresh(!refresh);
    setSelectedCustomer(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Customers Management</h1>

      <CustomerForm reload={reload} selectedCustomer={selectedCustomer} />

      <CustomerTable
        refresh={refresh}
        reload={reload}
        setSelectedCustomer={setSelectedCustomer}
      />
    </div>
  );
}
