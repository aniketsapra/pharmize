import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

function Medicines() {
  const [medicines, setMedicines] = useState([])
  const [nameFilter, setNameFilter] = useState("")
  const [batchFilter, setBatchFilter] = useState("")
  const [expandedRow, setExpandedRow] = useState(null)
  const [supplierFilter, setSupplierFilter] = useState("")
  const [suidFilter, setSuidFilter] = useState("")


  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch("http://localhost:8000/medicines", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const data = await response.json()
        setMedicines(data)
      } catch (error) {
        console.error("Error fetching medicines:", error)
      }
    }

    fetchMedicines()
  }, [])

  const toggleRow = (id) => {
    setExpandedRow(prev => (prev === id ? null : id))
  }

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
    medicine.batch_number.toLowerCase().includes(batchFilter.toLowerCase()) &&
    (medicine.supplier_name?.toLowerCase() || "").includes(supplierFilter.toLowerCase()) &&
    medicine.SUID.toString().includes(suidFilter)
  )
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Medicines</h1>
      <p className="text-gray-600 mt-1 mb-4">List of all medicines in inventory.</p>
      <hr className="mb-6 border-gray-300" />

      <div className="flex gap-4">
        {/* Table */}
        <div className="w-[80%]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Batch #</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Cost (₹)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
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

                  {/* Expanded row */}
                  {expandedRow === med.id && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={7} className="py-3">
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

        {/* Filters (unchanged) */}
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
  )
}

export default Medicines
