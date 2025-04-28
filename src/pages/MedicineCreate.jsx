import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MedicineCreate() {
  const [selectedSupplier, setSelectedSupplier] = useState('');
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

  // Handle supplier selection change
  const handleSupplierChange = (e) => {
    setSelectedSupplier(e.target.value);
  };

  // Handle input changes for each medicine row
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [name]: value,
    };
    setMedicines(updatedMedicines);
  };

  // Add new medicine row
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }
    
    const medicinesData = medicines.map(medicine => ({
      ...medicine,
      supplier: selectedSupplier
    }));
    
    console.log('Medicines Data:', medicinesData);
    // TODO: Send data to the backend
    
    // Reset form
    setSelectedSupplier('');
    setMedicines([{
      name: '',
      batchNumber: '',
      expiryDate: '',
      quantity: '',
      costPrice: '',
      category: '',
      description: '',
    }]);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add Medicines</h1>
        <p className="text-gray-600 mt-1">
          Fill in the medicine details to keep your inventory updated and organized.
        </p>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Supplier Selection Form */}
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
              <option value="ABC Pharma">ABC Pharma</option>
              <option value="XYZ Distributors">XYZ Distributors</option>
              <option value="MediCare Suppliers">MediCare Suppliers</option>
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

      {/* Medicine Table Form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Medicine Name *</th>
                <th className="border border-gray-300 px-4 py-2">Batch Number *</th>
                <th className="border border-gray-300 px-4 py-2">Expiry Date *</th>
                <th className="border border-gray-300 px-4 py-2">Quantity *</th>
                <th className="border border-gray-300 px-4 py-2">Cost Price (per unit) *</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="name"
                      value={medicine.name}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      name="batchNumber"
                      value={medicine.batchNumber}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="date"
                      name="expiryDate"
                      value={medicine.expiryDate}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="quantity"
                      value={medicine.quantity}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      name="costPrice"
                      value={medicine.costPrice}
                      onChange={(e) => handleChange(index, e)}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    <textarea
                      name="description"
                      value={medicine.description}
                      onChange={(e) => handleChange(index, e)}
                      rows="2"
                      className="w-full border rounded px-3 py-2"
                    ></textarea>
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMedicines(medicines.filter((_, i) => i !== index))}
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