import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Dashboard = () => {
  const [totals, setTotals] = useState({
    medicines: 0,
    suppliers: 0,
    customers: 0,
    invoices: 0,
  });

  const [monthlySales, setMonthlySales] = useState([]);
  const [currentMonthSales, setCurrentMonthSales] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [lowQuantityMedicines, setLowQuantityMedicines] = useState([]);
  const [nearExpiryMedicines, setNearExpiryMedicines] = useState([]);
  const [purchaseSummary, setPurchaseSummary] = useState({
    total: 0,
    current_month: 0,
  });
  const [activityLogs, setActivityLogs] = useState([]);

  const getIcon = (type) => {
  switch (type) {
    case "archiving":
      return "archive";
    case "addition":
      return "add";
    case "edit":
      return "edit";
    case "invoice":
      return "receipt";
    default:
      return "info";
  }
};

const getBgColor = (type) => {
  switch (type) {
    case "archiving":
      return "bg-red-100";
    case "addition":
      return "bg-green-100";
    case "edit":
      return "bg-white";
    case "invoice":
      return "bg-blue-100";
    default:
      return "bg-gray-100";
  }
};


useEffect(() => {
  const token = localStorage.getItem("token");

 fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/totals`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      // Debug: Check the response structure
      console.log(data); // Log the response to see its structure

      // Directly set the totals without assuming it's an array
      setTotals({
        medicines: data.medicines, // No need for filtering or checking array
        suppliers: data.suppliers,
        customers: data.customers,
        invoices: data.invoices,
      });
    })
    .catch(console.error);

  // Fetching monthly sales data
  fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/monthly-sales`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      setMonthlySales(data || []);

      const now = new Date();
      const currentMonthKey = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      const currentMonth = data.find(item => item.month === currentMonthKey);
      const total = data.reduce((sum, item) => sum + (item.total || 0), 0);

      setCurrentMonthSales(currentMonth?.total || 0);
      setTotalSales(total);
    })
    .catch(console.error);

  // Fetching purchase summary data
  fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/purchase-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(setPurchaseSummary)
    .catch(console.error);  

  // Fetching low quantity medicines, excluding inactive ones
  fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/medicines/low-quantity`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then((medicines) => {
      // Ensure it's an array and filter out inactive ones
      if (Array.isArray(medicines)) {
        setLowQuantityMedicines(medicines.filter((med) => med.is_active !== false));
      } else {
        console.error('Low quantity medicines data is not an array', medicines);
        setLowQuantityMedicines([]);
      }
    })
    .catch(console.error);

  // Fetching near expiry medicines, excluding inactive ones
  fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/medicines/near-expiry`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then((medicines) => {
      // Ensure it's an array and filter out inactive ones
      if (Array.isArray(medicines)) {
        setNearExpiryMedicines(medicines.filter((med) => med.is_active !== false));
      } else {
        console.error('Near expiry medicines data is not an array', medicines);
        setNearExpiryMedicines([]);
      }
    })
    .catch(console.error);

  
   fetch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/recent-logs`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      setActivityLogs(data.slice(-4)); // fallback if backend doesn't support limit param
    })
    .catch(console.error);

}, []);


  const recentSales = monthlySales.slice(-12);

  const chartData = {
    labels: recentSales.map((item) => {
      const [month, year] = item.month.split("-");
      return new Date(year, month - 1).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
    }),
    datasets: [
      {
        label: 'Monthly Sales',
        data: recentSales.map((item) => item.total),
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important for custom height
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <hr className="my-4 border-t-2 border-gray-300" />

      <div className="flex gap-4">
        {/* Main Left Section */}
        <div className="w-3/4 bg-white p-4 rounded-lg shadow flex flex-col gap-4">

          {/* Chart */}
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-2">Monthly Sales Overview</h2>
            <div className="h-[250px] w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

         {/* Summary Section */}
<div className="w-full bg-gray-50 p-4 rounded-lg shadow">
  <div className="flex justify-between gap-4 text-sm">
    {/* Sales Summary */}
    <div className="w-1/2 bg-white p-3 rounded shadow">
      <Link to='/report/sales'>
      <h4 className="font-semibold mb-2">Sales</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Current Month:</span>
          <span className="font-medium text-blue-700">₹{currentMonthSales}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Sales:</span>
          <span className="font-medium text-green-700">₹{totalSales}</span>
        </div>
      </div>
      </Link>
    </div>

    {/* Purchases Summary */}
    <div className="w-1/2 bg-white p-3 rounded shadow">
      <Link to='/report/purchase'>
      <h4 className="font-semibold mb-2">Purchases</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Current Month:</span>
          <span className="font-medium text-blue-700">₹{purchaseSummary.current_month}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Purchases:</span>
          <span className="font-medium text-green-700">₹{purchaseSummary.total}</span>
        </div>
      </div>
      </Link>
    </div>
  </div>
</div>

{/* Activity Log Card */}
{activityLogs.length > 0 && (
    <Link to="/activity" className="block">
      <div className="w-full bg-gray-50 p-2 rounded-lg shadow hover:bg-gray-100 transition-colors duration-200">
        <h2 className="text-md font-semibold mb-2">Recent Activity</h2>
        <ul className="text-sm divide-y">
          {activityLogs.map((log, index) => (
            <li
              key={index}
              className={`${getBgColor(log.type)} mb-1`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xs">{getIcon(log.type)}</span>
                  <span>{log.message}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Link>
)}


        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 bg-white p-4 rounded-lg shadow h-[620px] overflow-y-auto">
          <h2 className="text-md font-semibold mb-2">Total Records</h2>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between">
              <Link to="/medicine/inventory">Medicines:</Link><span>{totals.medicines}</span>
            </div>
            <div className="flex justify-between">
              <Link to="/supplier/view">Suppliers:</Link><span>{totals.suppliers}</span>
            </div>
            <div className="flex justify-between">
              <Link to="/customer/view">Customers:</Link><span>{totals.customers}</span>
            </div>
            <div className="flex justify-between">
              <Link to="/invoice/view">Invoices:</Link><span>{totals.invoices}</span>
            </div>
          </div>

          {/* Low Stock Section */}
<Link to='/medicine/inventory'>
{lowQuantityMedicines.length > 0 && (
  <>
    <hr className="my-4" />
    <div>
      <h3 className="flex justify-between bg-red-100 animate-pulse text-red-800 font-semibold rounded px-2 py-1">
        Low Stock
      </h3>
      <ul className="text-sm mt-2">
        {lowQuantityMedicines.map((m) => (
          <li key={m.id} className="flex justify-between">
            <span>{m.name}</span>
            <span>{m.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  </>
)}

{/* Near Expiry Section */}
{nearExpiryMedicines.length > 0 && (
  <>
    <hr className="my-4" />
    <div>
      <h3 className="flex justify-between bg-red-100 animate-pulse text-red-800 font-semibold rounded px-2 py-1">
        Near Expiry
      </h3>
      <ul className="text-sm mt-2">
        {nearExpiryMedicines.map((m) => (
          <li key={m.id} className="flex justify-between">
            <span>{m.name}</span>
            <span>{new Date(m.expiry_date).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  </>
)}
</Link>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
