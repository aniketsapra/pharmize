import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PurchaseReport = () => {
  const [purchases, setPurchases] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSuid, setSelectedSuid] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState({ total_quantity: 0, total_amount: 0 });

  const token = localStorage.getItem("token");

  const getDateMonthsAgo = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date.toISOString().split("T")[0];
  };

  const fetchSuppliers = async () => {
    const res = await fetch("http://localhost:8000/suppliers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSuppliers(data);
  };

  const fetchReport = async (from, to, suid = "") => {
    const params = new URLSearchParams({
      start_date: from,
      end_date: to,
      ...(suid && { suid }),
    });

    const res = await fetch(`http://localhost:8000/purchase-report?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch purchase report");

    const data = await res.json();
    setPurchases(data.data || []);
    setSummary({
      total_quantity: data.total_quantity,
      total_amount: data.total_amount,
    });
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const threeMonthsAgo = getDateMonthsAgo(3);
    setStartDate(threeMonthsAgo);
    setEndDate(today);
    fetchSuppliers();
    fetchReport(threeMonthsAgo, today);
  }, []);

  const handleGenerateReport = () => {
    fetchReport(startDate, endDate, selectedSuid);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Purchase Report</h1>
      <p className="text-gray-600">Grouped by P_ID, Supplier, and Date</p>
      <hr />

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Supplier</label>
          <select value={selectedSuid} onChange={e => setSelectedSuid(e.target.value)}
            className="border px-3 py-2 rounded">
            <option value="">All</option>
            {suppliers.map(s => (
              <option key={s.SUID} value={s.SUID}>{s.name}</option>
            ))}
          </select>
        </div>
        <button onClick={handleGenerateReport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Generate Report
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gray-100 p-4 rounded shadow space-y-1">
        <p><strong>Total Amount:</strong> ₹{summary.total_amount.toFixed(2)}</p>
        <p><strong>Total Quantity:</strong> {summary.total_quantity}</p>
      </div>

      {/* Table */}
      <div className="mt-6 border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Purchase ID</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>No. of Medicines</TableHead>
              <TableHead>Total Items</TableHead>
              <TableHead>Total Price (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No purchase records found.
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((p) => (
                <React.Fragment key={p.purchase_id}>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleExpand(p.purchase_id)}
                  >
                    <TableCell>{p.date}</TableCell>
                    <TableCell>{p.purchase_id}</TableCell>
                    <TableCell>{p.supplier_name}</TableCell>
                    <TableCell>{p.items.length}</TableCell>
                    <TableCell>{p.total_quantity}</TableCell>
                    <TableCell>₹{p.total_amount.toFixed(2)}</TableCell>
                  </TableRow>
                  {expandedId === p.purchase_id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-gray-50">
                        <div className="p-4 text-sm space-y-2">
                          <p><strong>Date:</strong> {p.date}</p>
                          <p><strong>Purchase ID:</strong> {p.purchase_id}</p>
                          <p><strong>SUID:</strong> {p.suid}</p>
                          <p><strong>Supplier Name:</strong> {p.supplier_name}</p>
                          <hr />
                          <p><strong>Items:</strong></p>
                          <ul className="list-disc pl-6">
                            {p.items.map((item, i) => (
                              <li key={i}>
                                {item.medicine_name} × {item.quantity} @ ₹{item.unit_price} = ₹{item.total_cost.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-2"><strong>Total Price:</strong> ₹{p.total_amount.toFixed(2)}</p>
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

export default PurchaseReport;
