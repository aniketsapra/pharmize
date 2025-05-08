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
      entryDate: new Date().toISOString().split('T')[0], // today's date
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
        entryDate: new Date().toISOString().split('T')[0],
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

    const medicinesData = medicines.map((medicine) => ({
      ...medicine,
      SUID: parseInt(selectedSupplier),
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
          entryDate: new Date().toISOString().split('T')[0],
          quantity: '',
          costPrice: '',
          category: '',
          description: '',
        },
      ]);
    } catch (error) {
      console.error('Error submitting medicines:', error.message);
      alert('Submission failed: ' + error.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Add Medicines</h1>
        <p className="text-gray-600 mt-2">
          Fill in the medicine details to keep your inventory updated and organized.
        </p>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Supplier Selection */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="supplier">
          Select Supplier *
        </label>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <select
            id="supplier"
            value={selectedSupplier}
            onChange={handleSupplierChange}
            required
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="text-blue-600 font-medium hover:underline whitespace-nowrap"
          >
            + Add New Supplier
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 space-y-6">
  {medicines.map((medicine, index) => (
    <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-4 relative">
      {medicines.length > 1 && (
        <button
          type="button"
          onClick={() => setMedicines(medicines.filter((_, i) => i !== index))}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
        >
          Remove
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
          <input
            type="text"
            name="name"
            value={medicine.name}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
          <input
            type="text"
            name="batchNumber"
            value={medicine.batchNumber}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entry Date *</label>
          <input
            type="date"
            name="entryDate"
            value={medicine.entryDate}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
          <input
            type="date"
            name="expiryDate"
            value={medicine.expiryDate}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={medicine.quantity}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price *</label>
          <input
            type="number"
            name="costPrice"
            value={medicine.costPrice}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={medicine.description}
            onChange={(e) => handleChange(index, e)}
            rows="2"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
      </div>
    </div>
  ))}

  {/* Action Buttons */}
  <div className="flex flex-col md:flex-row justify-between gap-4">
    <button
      type="button"
      onClick={addMedicineRow}
      className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-md"
    >
      + Add Another Medicine
    </button>
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md"
    >
      Submit All Medicines
    </button>
  </div>
</form>

    </div>
  );
}

export default MedicineCreate;
