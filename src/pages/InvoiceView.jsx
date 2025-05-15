import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

function InvoiceView() {
  const [invoices, setInvoices] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [customerFilter, setCustomerFilter] = useState("")
  const [invoiceIdFilter, setInvoiceIdFilter] = useState("")
  const [medicineFilter, setMedicineFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invoices`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const data = await response.json()
        setInvoices(data)
      } catch (error) {
        console.error("Error fetching invoices:", error)
      }
    }
    fetchInvoices()
  }, [])

  const toggleRow = (id) => {
    setExpandedRow(prev => (prev === id ? null : id))
  }

  const filteredInvoices = invoices.filter(inv => {
    const invoiceDate = new Date(inv.date)
    const matchesCustomer = inv.customer_name?.toLowerCase().includes(customerFilter.toLowerCase())
    const matchesInvoiceId = inv.id.toString().includes(invoiceIdFilter)
    const matchesMedicine = inv.items.some(item =>
      item.medicine_name?.toLowerCase().includes(medicineFilter.toLowerCase())
    )
    const matchesStartDate = startDate ? invoiceDate >= new Date(startDate) : true
    const matchesEndDate = endDate ? invoiceDate <= new Date(endDate) : true

    return matchesCustomer && matchesInvoiceId && matchesMedicine && matchesStartDate && matchesEndDate
  })

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Invoices</h1>
      <p className="text-gray-600 mt-1 mb-4">List of all invoices.</p>
      <hr className="mb-6 border-gray-300" />

      <div className="flex gap-4">
        <div className="w-[80%]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Discount (%)</TableHead>
                <TableHead>Total (₹)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map(inv => (
                <React.Fragment key={inv.id}>
                  <TableRow
                    onClick={() => toggleRow(inv.id)}
                    className="cursor-pointer hover:bg-gray-100 transition"
                  >
                    <TableCell>{inv.id}</TableCell>
                    <TableCell>{inv.customer_name}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{inv.discount}</TableCell>
                    <TableCell>{inv.total_amount}</TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // handle delete if needed
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                  {expandedRow === inv.id && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={6} className="py-3">
                        <div className="space-y-2">
                          <p><strong>Invoice ID:</strong> {inv.id}</p>
                          <p><strong>CUID:</strong> {inv.CUID}</p>
                          <p><strong>Customer:</strong> {inv.customer_name}</p>

                          <p><strong>Items:</strong></p>
                          <ul className="list-disc list-inside ml-4">
                            {inv.items.map(item => (
                              <li key={item.id}>
                                {item.medicine_name} (x{item.quantity}) - ₹{item.unit_price} each
                              </li>
                            ))}
                          </ul>

                          {(() => {
                            const amountBefore = inv.total_amount / (1 - inv.discount / 100)
                            const discountAmount = amountBefore - inv.total_amount

                            return (
                              <>
                                <p><strong>Amount Before Discount:</strong> ₹{amountBefore.toFixed(2)}</p>
                                <p><strong>Discount ({inv.discount}%):</strong> ₹{discountAmount.toFixed(2)}</p>
                                <p><strong>Total After Discount:</strong> ₹{inv.total_amount.toFixed(2)}</p>
                              </>
                            )
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="w-[20%] border-l pl-4 space-y-4">
          <h2 className="text-lg font-semibold">Filter Invoices</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by customer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice ID</label>
            <input
              type="text"
              value={invoiceIdFilter}
              onChange={(e) => setInvoiceIdFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
            <input
              type="text"
              value={medicineFilter}
              onChange={(e) => setMedicineFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by medicine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceView
