import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [editRow, setEditRow] = useState(null)
  const [editData, setEditData] = useState({})

  const [nameFilter, setNameFilter] = useState("")
  const [addressFilter, setAddressFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:8000/suppliers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const data = await response.json()
        setSuppliers(data)
      } catch (error) {
        console.error("Error fetching suppliers:", error)
      }
    }

    fetchSuppliers()
  }, [])

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier &&
      supplier.name?.toLowerCase().includes(nameFilter.toLowerCase()) &&
      supplier.address?.toLowerCase().includes(addressFilter.toLowerCase()) &&
      supplier.phone?.toLowerCase().includes(phoneFilter.toLowerCase()) &&
      supplier.email?.toLowerCase().includes(emailFilter.toLowerCase())
  )
  

  const handleEdit = (suid, supplier) => {
    setEditRow(suid)
    setEditData({ ...supplier })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (suid) => {
    try {
      const response = await fetch(`http://localhost:8000/supplier/update/${suid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editData),
      })
  
      if (!response.ok) {
        const errText = await response.text()
        console.error("Update failed:", errText)
        alert("Update failed.")
        return
      }
  
      const updatedSupplier = await response.json()
  
      // Sanity check before updating state
      if (!updatedSupplier || !updatedSupplier.name) {
        console.error("Invalid supplier data received:", updatedSupplier)
        alert("Server returned bad data.")
        return
      }
  
      setSuppliers((prev) =>
        prev.map((sup) => (sup.SUID === suid ? updatedSupplier : sup))
      )
  
      setEditRow(null)
      setEditData({})
    } catch (error) {
      console.error("Error updating supplier:", error)
      alert("Update failed.")
    }
  }  

  const handleCancel = () => {
    setEditRow(null)
    setEditData({})
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Suppliers</h1>
      <p className="text-gray-600 mt-1 mb-4">List of all registered suppliers in the system.</p>
      <hr className="mb-6 border-gray-300" />

      <div className="flex gap-4">
        <div className="w-[80%]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SUID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.SUID}>
                  <TableCell>{supplier.SUID}</TableCell>
                  <TableCell>
                    {editRow === supplier.SUID ? (
                      <input
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      supplier.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === supplier.SUID ? (
                      <input
                        type="text"
                        name="address"
                        value={editData.address}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      supplier.address
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === supplier.SUID ? (
                      <input
                        type="text"
                        name="phone"
                        value={editData.phone}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      supplier.phone
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === supplier.SUID ? (
                      <input
                        type="text"
                        name="email"
                        value={editData.email}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      supplier.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow === supplier.SUID ? (
                      <>
                        <button
                          onClick={() => handleSave(supplier.SUID)}
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
                        onClick={() => handleEdit(supplier.SUID, supplier)}
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
          <h2 className="text-lg font-semibold">Filter Suppliers</h2>
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

export default Suppliers
