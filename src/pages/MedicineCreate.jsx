import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MedicineCreate() {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([
    {
      name: '',
      batchNumber: '',
      expiryDate: '',
      quantity: '',
      costPrice: '',
      category: '',
      description: '',
    },
  ]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/suppliers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suppliers');
        }

        const data = await response.json();
        setSuppliers(data);
      } catch (error) {
        console.error('Error fetching suppliers:', error.message);
      }
    };

    fetchSuppliers();
  }, []);

  const handleSupplierChange = (e) => {
    setSelectedSupplier(e.target.value);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [name]: value,
    };
    setMedicines(updatedMedicines);
  };

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        batchNumber: '',
        expiryDate: '',
        quantity: '',
        costPrice: '',
        category: '',
        description: '',
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }

    // Send SUID instead of supplier_id
    const medicinesData = medicines.map((medicine) => ({
      ...medicine,
      SUID: parseInt(selectedSupplier),  // Using SUID here
    }));

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/medicine/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(medicinesData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit medicines');
      }

      const result = await response.json();
      console.log('Success:', result);
      alert('Medicines added successfully!');

      setSelectedSupplier('');
      setMedicines([
        {
          name: '',
          batchNumber: '',
          expiryDate: '',
          quantity: '',
          costPrice: '',
          description: '',
        },
      ]);
    } catch (error) {
      console.error('Error submitting medicines:', error.message);
      alert('Submission failed: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add Medicines</h1>
        <p className="text-gray-600 mt-1">
          Fill in the medicine details to keep your inventory updated and organized.
        </p>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Supplier Selection */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier">
            Select Supplier *
          </label>
          <div className="flex items-center">
            <select
              id="supplier"
              value={selectedSupplier}
              onChange={handleSupplierChange}
              required
              className="w-full md:w-1/2 border rounded px-3 py-2"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.SUID} value={supplier.SUID}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <Link
              to="/supplier/add"
              className="ml-4 text-blue-500 hover:text-blue-700 text-sm"
            >
              + Add New Supplier
            </Link>
          </div>
        </div>
      </div>

      {/* Medicine Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border px-4 py-2">Medicine Name *</th>
                <th className="border px-4 py-2">Batch Number *</th>
                <th className="border px-4 py-2">Expiry Date *</th>
                <th className="border px-4 py-2">Quantity *</th>
                <th className="border px-4 py-2">Cost Price *</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      name="name"
                      value={medicine.name}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      name="batchNumber"
                      value={medicine.batchNumber}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="date"
                      name="expiryDate"
                      value={medicine.expiryDate}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      name="quantity"
                      value={medicine.quantity}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="number"
                      name="costPrice"
                      value={medicine.costPrice}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <textarea
                      name="description"
                      value={medicine.description}
                      onChange={(e) => handleChange(index, e)}
                      rows="2"
                      className="w-full border rounded px-3 py-2"
                    ></textarea>
                  </td>
                  <td className="border px-4 py-2">
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMedicines(medicines.filter((_, i) => i !== index))
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={addMedicineRow}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              + Add Another Medicine
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit All Medicines
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MedicineCreate;
