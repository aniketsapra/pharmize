import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState("");
  const [suidFilter, setSuidFilter] = useState("");

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch("http://localhost:8000/medicines", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setMedicines(data);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();
  }, []);

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
    medicine.batch_number.toLowerCase().includes(batchFilter.toLowerCase()) &&
    (medicine.supplier_name?.toLowerCase() || "").includes(supplierFilter.toLowerCase()) &&
    medicine.SUID.toString().includes(suidFilter)
  );

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this medicine?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/medicine/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setMedicines((prev) => prev.filter((med) => med.id !== id));
      } else {
        const errorData = await response.json();
        alert("Failed to delete medicine: " + errorData.detail);
      }
    } catch (error) {
      console.error("Error deleting medicine:", error);
      alert("Something went wrong while deleting the medicine.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Medicines</h1>
      <p className="text-gray-600 mt-1 mb-4">List of all medicines in inventory.</p>
      <hr className="mb-6 border-gray-300" />

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Low Stock */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Low on Stock</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[150px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 z-10 bg-white">ID</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-white">Name</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-white">Batch</TableHead>
                    <TableHead className="sticky top-0 z-10 bg-white">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.filter(med => med.quantity <= 20).map(med => (
                    <TableRow key={med.id}>
                      <TableCell>{med.id}</TableCell>
                      <TableCell>{med.name}</TableCell>
                      <TableCell>{med.batch_number}</TableCell>
                      <TableCell>{med.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Near Expiry */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Near Expiry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[150px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines
                    .filter((med) => {
                      const expiry = dayjs(med.expiry_date);
                      const now = dayjs();
                      return expiry.isAfter(now) && expiry.diff(now, "day") <= 30;
                    })
                    .map((med) => (
                      <TableRow key={med.id}>
                        <TableCell>{med.id}</TableCell>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.batch_number}</TableCell>
                        <TableCell>{dayjs(med.expiry_date).format("YYYY-MM-DD")}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className="w-[80%] border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="sticky top-0 z-10 bg-white">ID</TableHead>
        <TableHead className="sticky top-0 z-10 bg-white">Name</TableHead>
        <TableHead className="sticky top-0 z-10 bg-white">Batch #</TableHead>
        <TableHead className="sticky top-0 z-10 bg-white">Entry</TableHead>
        <TableHead className="sticky top-0 z-10 bg-white">Expiry</TableHead>
        <TableHead className="sticky top-0 z-10 bg-white">Qty</TableHead>
        <TableHead className="sticky top-0 z-10 bg-white">Cost (₹)</TableHead>
        <TableHead className="sticky top-0 z-10 bg-white">Actions</TableHead>
      </TableRow>
    </TableHeader>
  </Table>

  {/* Scrollable table body */}
  <div className="max-h-[450px] overflow-auto">
    <Table>
      <TableBody>
        {filteredMedicines.map((med) => (
          <React.Fragment key={med.id}>
            <TableRow
              onClick={() => toggleRow(med.id)}
              className="cursor-pointer hover:bg-gray-100 transition"
            >
              <TableCell>{med.id}</TableCell>
              <TableCell>{med.name}</TableCell>
              <TableCell>{med.batch_number}</TableCell>
              <TableCell>{med.entry_date}</TableCell>
              <TableCell>{med.expiry_date}</TableCell>
              <TableCell>{med.quantity}</TableCell>
              <TableCell>{med.cost_price}</TableCell>
              <TableCell>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(med.id)
                  }}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>

            {expandedRow === med.id && (
              <TableRow className="bg-gray-50">
                <TableCell colSpan={8} className="py-3">
                  <div className="space-y-1">
                    <p><strong>Medicine ID:</strong> {med.id}</p>
                    <p><strong>Medicine Name:</strong> {med.name}</p>
                    <p><strong>SUID:</strong> {med.SUID}</p>
                    <p><strong>Supplier Name:</strong> {med.supplier_name || "N/A"}</p>
                    <p><strong>Description:</strong> {med.description || "N/A"}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  </div>
</div>

        {/* Filters */}
        <div className="w-[20%] border-l pl-4 space-y-4">
          <h2 className="text-lg font-semibold">Filter Medicines</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Batch Number</label>
            <input
              type="text"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by batch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
            <input
              type="text"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by supplier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier ID (SUID)</label>
            <input
              type="text"
              value={suidFilter}
              onChange={(e) => setSuidFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by SUID"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Medicines;
