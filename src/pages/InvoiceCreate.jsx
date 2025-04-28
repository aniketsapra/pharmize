import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';

const InvoiceCreate = () => {
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([
    { medicineId: '', quantity: 1, unitPrice: 0, availableStock: 0, total: 0 },
  ]);
  const [discount, setDiscount] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  // Fetch customers & medicines (dummy placeholders for now)
  useEffect(() => {
    setCustomers([
      { _id: 'c1', name: 'John Doe' },
      { _id: 'c2', name: 'Jane Smith' },
    ]);
    setMedicines([
      { _id: 'm1', name: 'Paracetamol', stock: 50, price: 5 },
      { _id: 'm2', name: 'Amoxicillin', stock: 30, price: 10 },
    ]);
  }, []);

  const handleMedicineChange = (index, medicineId) => {
    const med = medicines.find((m) => m._id === medicineId);
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      medicineId,
      unitPrice: med.price,
      availableStock: med.stock,
      quantity: 1,
      total: med.price * 1,
    };
    setItems(updatedItems);
  };

  const handleQuantityChange = (index, qty) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    const quantity = Math.min(qty, item.availableStock);
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = quantity * item.unitPrice;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { medicineId: '', quantity: 1, unitPrice: 0, availableStock: 0, total: 0 },
    ]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const finalTotal = subtotal - (subtotal * discount) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      selectedCustomer,
      date: today,
      items,
      discount,
      finalTotal,
    });
    // TODO: Send data to backend
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-1">Create Invoice</h2>
      <p className="text-gray-600 mb-4">Generate a new invoice for medicine sales</p>
      <hr className="mb-6" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selector */}
        <div>
          <label className="block mb-1 font-medium">Customer</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Customer</option>
            {customers.map((cust) => (
              <option key={cust._id} value={cust._id}>
                {cust.name}
              </option>
            ))}
          </select>
          <Link
            to="/customer/add"
            className="ml-4 text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add New Customer
          </Link>
        </div>

        {/* Invoice Date */}
        <div>
          <label className="block mb-1 font-medium">Invoice Date</label>
          <input
            type="date"
            value={today}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Medicine Cart */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-6 gap-3 items-end">
              <div className="col-span-2">
                <label className="block text-sm font-medium">Medicine</label>
                <select
                  value={item.medicineId}
                  onChange={(e) => handleMedicineChange(index, e.target.value)}
                  required
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Select</option>
                  {medicines.map((med) => (
                    <option key={med._id} value={med._id}>
                      {med.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Stock</label>
                <input
                  type="number"
                  value={item.availableStock}
                  readOnly
                  className="w-full bg-gray-100 px-2 py-1 rounded border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={item.availableStock}
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                  required
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Unit Price</label>
                <input
                  type="number"
                  value={item.unitPrice}
                  readOnly
                  className="w-full bg-gray-100 px-2 py-1 rounded border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Total</label>
                <input
                  type="number"
                  value={item.total.toFixed(2)}
                  readOnly
                  className="w-full bg-gray-100 px-2 py-1 rounded border"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="text-blue-600 text-sm hover:underline"
          >
            + Add another medicine
          </button>
        </div>

        {/* Discount & Final Total */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full border rounded px-2 py-1"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Final Total</label>
            <input
              type="text"
              readOnly
              value={`₹${finalTotal.toFixed(2)}`}
              className="w-full bg-gray-100 px-2 py-1 rounded border"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="reset"
            onClick={() => {
              setItems([{ medicineId: '', quantity: 1, unitPrice: 0, availableStock: 0, total: 0 }]);
              setDiscount(0);
            }}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Reset
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreate;
