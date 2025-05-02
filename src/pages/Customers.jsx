import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function customers() {
  const [customers, setCustomers] = useState([])

  // Separate filters
  const [nameFilter, setNameFilter] = useState("")
  const [addressFilter, setAddressFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:8000/customers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const data = await response.json()
        setCustomers(data)
      } catch (error) {
        console.error("Error fetching customers:", error)
      }
    }

    fetchCustomers()
  }, [])

  // Filter based on inputs
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
    customer.address.toLowerCase().includes(addressFilter.toLowerCase()) &&
    customer.phone.toLowerCase().includes(phoneFilter.toLowerCase()) &&
    customer.email.toLowerCase().includes(emailFilter.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <p className="text-gray-600 mt-1 mb-4">List of all registered customers in the system.</p>
      <hr className="mb-6 border-gray-300" />

      <div className="flex gap-4">
        {/* Left side - Table */}
        <div className="w-[80%]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CUID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.CUID}>
                  <TableCell>{customer.CUID}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Right side - Filter inputs */}
        <div className="w-[20%] border-l pl-4 space-y-4">
          <h2 className="text-lg font-semibold">Filter Customers</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Search by email"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default customers
