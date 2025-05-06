import React, { useEffect, useState } from 'react';

const PurchaseReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuid, setSelectedSuid] = useState('');
  const [report, setReport] = useState(null);

  const token = localStorage.getItem('token');

  // 📌 Helper to get date N months ago
  const getDateMonthsAgo = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  };

  // 📌 Fetch report with provided dates
  const fetchReport = async (fromDate, toDate, suid = '') => {
    if (!fromDate || !toDate) return;

    const params = new URLSearchParams({
      start_date: fromDate,
      end_date: toDate,
      ...(suid && { suid })
    });

    try {
      const res = await fetch(`http://localhost:8000/purchase-report?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch report');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsAgo = getDateMonthsAgo(3);

    setStartDate(threeMonthsAgo);
    setEndDate(today);
    fetchReport(threeMonthsAgo, today);

    const fetchSuppliers = async () => {
      try {
        const res = await fetch('http://localhost:8000/suppliers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setSuppliers(data);
      } catch (err) {
        console.error('Failed to load suppliers', err);
      }
    };

    fetchSuppliers();
  }, [token]);

  // 📌 On "Generate Report" button click
  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
    fetchReport(startDate, endDate, selectedSuid);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Purchase Report</h1>
      <p className="text-gray-600">View medicine purchases filtered by date and supplier.</p>
      <hr />

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Supplier</label>
          <select
            value={selectedSuid}
            onChange={(e) => setSelectedSuid(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.SUID} value={s.SUID}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerateReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Generate Report
        </button>
      </div>

      {/* Report Results */}
      {report && (
  <div className="mt-6 space-y-4">
    <div className="bg-gray-100 p-4 rounded shadow">
      <p><strong>Total Amount Spent:</strong> ₹{report.total_amount}</p>
      <p><strong>Total Quantity Purchased:</strong> {report.total_quantity}</p>
    </div>

    {report.data.length === 0 ? (
      <div className="text-center text-gray-500 text-lg py-10">
        No purchase records found for the selected filters.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Medicine</th>
              <th className="border px-4 py-2">Supplier</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {report.data.map((row, i) => (
              <tr key={i}>
                <td className="border px-4 py-2">{row.entry_date}</td>
                <td className="border px-4 py-2">{row.medicine_name}</td>
                <td className="border px-4 py-2">{row.supplier_name}</td>
                <td className="border px-4 py-2">{row.quantity}</td>
                <td className="border px-4 py-2">₹{row.total_cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

    </div>
  );
};

export default PurchaseReport;
