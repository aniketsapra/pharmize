import React, { useEffect, useState } from 'react';

const SalesReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCuid, setSelectedCuid] = useState('');
  const [report, setReport] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('http://localhost:8000/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error('Failed to load customers', err);
      }
    };

    fetchCustomers();
    fetchInitialReport(); // fetch last 3 months' sales
  }, []);

  const fetchInitialReport = async () => {
    const today = new Date();
    const pastDate = new Date(today.setMonth(today.getMonth() - 3));
    const start = pastDate.toISOString().split('T')[0];
    const end = new Date().toISOString().split('T')[0];

    setStartDate(start);
    setEndDate(end);
    fetchReport(start, end, selectedCuid);
  };

  const fetchReport = async (start = startDate, end = endDate, cuid = selectedCuid) => {
    const params = new URLSearchParams({
      start_date: start,
      end_date: end,
      ...(cuid && { cuid })
    });

    try {
      const res = await fetch(`http://localhost:8000/sales-report?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch report');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Error fetching sales report:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sales Report</h1>
      <p className="text-gray-600">View sales filtered by date and customer.</p>
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
          <label className="block mb-1 text-sm font-medium">Customer</label>
          <select
            value={selectedCuid}
            onChange={(e) => setSelectedCuid(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.CUID} value={c.CUID}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => fetchReport()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Generate Report
        </button>
      </div>

      {/* Report Results */}
      {report ? (
        report.data.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-100 p-4 rounded shadow">
              <p><strong>Total Sales:</strong> ₹{report.total_sales}</p>
              <p><strong>Total Items Sold:</strong> {report.total_quantity}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Invoice No</th>
                    <th className="border px-4 py-2">Customer</th>
                    <th className="border px-4 py-2">Medicine</th>
                    <th className="border px-4 py-2">Qty</th>
                    <th className='border px-4 py-2'>Units</th>
                    <th className="border px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border px-4 py-2">{item.invoice_date}</td>
                      <td className="border px-4 py-2">{item.invoice_id}</td>
                      <td className="border px-4 py-2">{item.customer_name}</td>
                      <td className="border px-4 py-2">{item.medicine_name}</td>
                      <td className="border px-4 py-2">{item.quantity}</td>
                      <td className='border px-4 py-2'>{item.unit_price}</td>
                      <td className="border px-4 py-2">₹{item.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-6">No sales report available.</div>
        )
      ) : null}
    </div>
  );
};

export default SalesReport;
