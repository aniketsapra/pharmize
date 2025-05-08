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

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/dashboard/totals", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setTotals(data || {}))
      .catch(console.error);

    fetch("http://localhost:8000/dashboard/monthly-sales", {
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

    fetch("http://localhost:8000/medicines/low-quantity", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setLowQuantityMedicines)
      .catch(console.error);

    fetch("http://localhost:8000/medicines/near-expiry", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setNearExpiryMedicines)
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

          {/* Sales Summary Card */}
          <div className="w-full bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-md font-semibold mb-2">Sales Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current Month:</span>
                <span className="font-medium text-blue-700">₹{currentMonthSales}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Sales:</span>
                <span className="font-medium text-green-700">₹{totalSales}</span>
              </div>
            </div>
          </div>
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

          <hr className="my-4" />
          <div>
            <h3 className="font-semibold">Low Stock</h3>
            <ul className="text-sm mt-2">
              {lowQuantityMedicines.map((m) => (
                <li key={m.id} className="flex justify-between">
                  <span>{m.name}</span>
                  <span>{m.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          <hr className="my-4" />
          <div>
            <h3 className="font-semibold">Near Expiry</h3>
            <ul className="text-sm mt-2">
              {nearExpiryMedicines.map((m) => (
                <li key={m.id} className="flex justify-between">
                  <span>{m.name}</span>
                  <span>{new Date(m.expiry_date).toLocaleDateString()}</span>
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
