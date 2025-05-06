import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SalesReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [reportSummary, setReportSummary] = useState({
    total_amount: 0,
    total_quantity: 0,
  });

  const token = localStorage.getItem("token");

  const getDateMonthsAgo = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date.toISOString().split("T")[0];
  };

  const fetchSalesReport = async (customStart, customEnd, customerId = '') => {
    const params = new URLSearchParams({
      start_date: customStart,
      end_date: customEnd,
      ...(customerId && { customer_id: customerId }),
    });

    try {
      const res = await fetch(`http://localhost:8000/sales-report?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch sales report");
      const data = await res.json();
      setInvoices(data.invoices || []);
      setReportSummary({
        total_amount: data.total_amount,
        total_quantity: data.total_quantity,
      });
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:8000/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const threeMonthsAgo = getDateMonthsAgo(3);
    setStartDate(threeMonthsAgo);
    setEndDate(today);
    fetchCustomers();
    fetchSalesReport(threeMonthsAgo, today);
  }, []);

  const handleGenerateReport = () => {
    fetchSalesReport(startDate, endDate, selectedCustomerId);
  };

  const toggleExpand = (id) => {
    setExpandedInvoiceId(prev => (prev === id ? null : id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sales Report</h1>
      <p className="text-gray-600">View medicine sales filtered by date and customer.</p>
      <hr />
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            className="border px-3 py-2 rounded w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            className="border px-3 py-2 rounded w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
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
          onClick={handleGenerateReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Generate Report
        </button>
      </div>

      {reportSummary && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-100 p-4 rounded shadow">
            <p><strong>Total Sales (₹):</strong> ₹{reportSummary.total_amount.toFixed(2)}</p>
            <p><strong>Total Quantity Sold:</strong> {reportSummary.total_quantity}</p>
          </div>
        </div>
      )}

      <div className="mt-6 border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>CUID</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Total Amount (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <React.Fragment key={invoice.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleExpand(invoice.id)}
                  >
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.CUID}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>₹{invoice.total_amount}</TableCell>
                  </TableRow>
                  {expandedInvoiceId === invoice.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-gray-50">
                        <div className="p-4 space-y-2 text-sm">
                          <p><strong>Invoice ID:</strong> {invoice.id}</p>
                          <p><strong>CUID:</strong> {invoice.CUID}</p>
                          <p><strong>Customer Name:</strong> {invoice.customer_name}</p>
                          <p><strong>Customer Address:</strong> {invoice.customer_address}</p>

                          <div>
                            <strong>Items:</strong>
                            <ul className="list-disc pl-5 mt-1">
                              {invoice.items.map((item, i) => (
                                <li key={i}>
                                  {item.medicine_name} × {item.quantity} @ ₹{item.unit_price}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <p>
                            <strong>Amount Before Discount:</strong> ₹
                            {invoice.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0).toFixed(2)}
                          </p>
                          <p><strong>Discount:</strong> {invoice.discount}%</p>
                          <p><strong>Amount After Discount:</strong> ₹{invoice.total_amount}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesReport;
