import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function Customers() {
  const [customers, setCustomers] = useState([])
  const [editRow, setEditRow] = useState(null) // track which row is being edited
  const [editData, setEditData] = useState({}) // track data being edited

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

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
    customer.address.toLowerCase().includes(addressFilter.toLowerCase()) &&
    customer.phone.toLowerCase().includes(phoneFilter.toLowerCase()) &&
    customer.email.toLowerCase().includes(emailFilter.toLowerCase())
  )

  const handleEdit = (cuid, customer) => {
    setEditRow(cuid)
    setEditData({ ...customer })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (cuid) => {
  try {
    const response = await fetch(`http://localhost:8000/customer/${cuid}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(editData),
    });

    if (!response.ok) {
      throw new Error("Failed to update customer.");
    }

    // Don't rely on response JSON — update manually
    setCustomers((prev) =>
      prev.map((cust) =>
        cust.CUID === cuid ? { ...cust, ...editData } : cust
      )
    );

    setEditRow(null);
    setEditData({});
  } catch (error) {
    console.error("Error updating customer:", error);
    alert("Update failed.");
  }
};

  const handleCancel = () => {
    setEditRow(null)
    setEditData({})
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <p className="text-gray-600 mt-1 mb-4">List of all registered customers in the system.</p>
      <hr className="mb-6 border-gray-300" />

      <div className="flex gap-4">
        <div className="w-[80%]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CUID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.CUID}>
                  <TableCell>{customer.CUID}</TableCell>
                  <TableCell>
                    {editRow === customer.CUID ? (
                      <input
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      customer.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === customer.CUID ? (
                      <input
                        type="text"
                        name="address"
                        value={editData.address}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      customer.address
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === customer.CUID ? (
                      <input
                        type="text"
                        name="phone"
                        value={editData.phone}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      customer.phone
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === customer.CUID ? (
                      <input
                        type="text"
                        name="email"
                        value={editData.email}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      customer.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === customer.CUID ? (
                      <>
                        <button
                          onClick={() => handleSave(customer.CUID)}
                          className="text-green-600 mr-2"
                        >
                          Save
                        </button>
                        <button onClick={handleCancel} className="text-red-600">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(customer.CUID, customer)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

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

export default Customers
