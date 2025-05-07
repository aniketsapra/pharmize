import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Dashboard = () => {
  const [totals, setTotals] = useState({
    medicines: 0,
    suppliers: 0,
    customers: 0,
    invoices: 0,
  });

  const [lowQuantityMedicines, setLowQuantityMedicines] = useState([]);
  const [nearExpiryMedicines, setNearExpiryMedicines] = useState([]);

  useEffect(() => {
    // Fetch Total Counts
    fetch("http://localhost:8000/dashboard/totals", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`, // if using JWT
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.medicines !== undefined) {
          setTotals(data);
        } else {
          console.error("Unexpected data structure for totals:", data);
        }
      })
      .catch((err) => console.error("Error fetching totals:", err));

    // Fetch Low Stock and Near Expiry data
    fetch("http://localhost:8000/dashboard/low-stock", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.lowStock !== undefined) {
          setLowStock(data.lowStock);  // Ensure you're accessing the correct property
        } else {
          console.error("Unexpected data structure for low stock:", data);
        }
      })
      .catch((err) => console.error("Error fetching low stock:", err));

    fetch("http://localhost:8000/dashboard/near-expiry", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.nearExpiry !== undefined) {
          setNearExpiry(data.nearExpiry); // Ensure you're accessing the correct property
        } else {
          console.error("Unexpected data structure for near expiry:", data);
        }
      })
      .catch((err) => console.error("Error fetching near expiry:", err));

    // Fetch Medicines with Low Quantity
    fetch("http://localhost:8000/medicines/low-quantity", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLowQuantityMedicines(data);  // Store medicines with low quantity
      })
      .catch((err) => console.error("Error fetching low quantity medicines:", err));

    // Fetch Medicines Near Expiry
    fetch("http://localhost:8000/medicines/near-expiry", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setNearExpiryMedicines(data);  // Store medicines near expiry
      })
      .catch((err) => console.error("Error fetching near expiry medicines:", err));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <hr className="my-4 border-t-2 border-gray-300" />
      
      <div className="flex gap-4">
        {/* Left section (3/4) */}
        <div className="w-3/4 bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Main Content</h2>
          <p className="text-gray-600">This is the left section occupying 3/4 width.</p>
        </div>
        
        {/* Right Section */}
              <div className="w-1/4 bg-white p-4 rounded-lg shadow h-[620px] overflow-y-auto">
        <h2 className="text-md font-semibold mb-2">Total Records</h2>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between">
            <Link to="/medicine/inventory" className="text-gray-700 text-sm">Medicines:</Link>
            <span className="font-semibold">{totals.medicines}</span>
          </div>
          <div className="flex justify-between">
            <Link to="/supplier/view" className="text-gray-700 text-sm">Suppliers:</Link>
            <span className="font-semibold">{totals.suppliers}</span>
          </div>
          <div className="flex justify-between">
            <Link to="/customer/view" className="text-gray-700 text-sm">Customers:</Link>
            <span className="font-semibold">{totals.customers}</span>
          </div>
          <div className="flex justify-between">
            <Link to="/invoice/view" className="text-gray-700 text-sm">Invoices:</Link>
            <span className="font-semibold">{totals.invoices}</span>
          </div>
        </div>

        <hr className="my-4 border-t-2 border-gray-300" />

        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-700">Low Stock</h3>
          <ul className="space-y-2 text-gray-700 text-sm mt-2">
            {lowQuantityMedicines.map((medicine) => (
              <li key={medicine.id} className="flex justify-between">
                <span>{medicine.name}</span>
                <span className="font-semibold">{medicine.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        <hr className="my-4 border-t-2 border-gray-300" />

        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-700">Near Expiry</h3>
          <ul className="space-y-2 text-gray-700 text-sm mt-2">
            {nearExpiryMedicines.map((medicine) => (
              <li key={medicine.id} className="flex justify-between">
                <span>{medicine.name}</span>
                <span>{new Date(medicine.expiry_date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      </div>
    </div>
  );
};

export default Dashboard;
