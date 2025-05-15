import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InvoiceCreate = () => {
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([{ medicineId: '', quantity: 1, unitPrice: 0, availableStock: 0, total: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        setError("Error fetching customers.");
      }
    };

    const fetchMedicines = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/medicines`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setMedicines(data);
      } catch (error) {
        setError("Error fetching medicines.");
      }
    };

    Promise.all([fetchCustomers(), fetchMedicines()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleMedicineChange = (index, medicineId) => {
    const selectedMedicine = medicines.find(m => String(m.id) === String(medicineId));
    if (!selectedMedicine) return;
  
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      medicineId,
      unitPrice: selectedMedicine.cost_price,
      availableStock: selectedMedicine.quantity,
      total: selectedMedicine.cost_price * updatedItems[index].quantity,
    };
  
    setItems(updatedItems);
  };
  

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    const updatedQuantity = Math.min(quantity, item.availableStock);
    updatedItems[index].quantity = updatedQuantity;
    updatedItems[index].total = updatedQuantity * item.unitPrice;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { medicineId: '', quantity: 1, unitPrice: 0, availableStock: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const finalTotal = subtotal - (subtotal * discount) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const invoiceData = {
      CUID: selectedCustomer,
      date: today,
      discount,
      items: items.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      finalTotal,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/invoice/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const data = await response.json();
      alert(`Invoice created successfully: ${data.message}`);

      setSelectedCustomer('');
      setItems([{ medicineId: '', quantity: 1, unitPrice: 0, availableStock: 0, total: 0 }]);
      setDiscount(0);
    } catch (error) {
      setError("Error creating invoice. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-2">Create Invoice</h2>
      <p className="text-gray-600 mb-6">Generate a new invoice for your medicine orders.</p>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select a Customer</option>
              {customers.map((customer) => (
                <option key={customer.CUID} value={customer.CUID}>
                  {customer.name}
                </option>
              ))}
            </select>
            <Link
              to="/customer/add"
              className="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block"
            >
              + Add New Customer
            </Link>
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Invoice Date</label>
            <input
              type="date"
              value={today}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Medicine List */}
          <div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-6 gap-3 items-end mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Medicine</label>
                  <select
                    value={item.medicineId}
                    onChange={(e) => handleMedicineChange(index, e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Medicine</option>
                    {medicines.map((medicine) => (
                      <option key={medicine.id} value={String(medicine.id)}>
                        {medicine.name}
                      </option>

                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    value={item.availableStock}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={item.availableStock}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Total</label>
                  <input
                    type="number"
                    value={item.total.toFixed(2)}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>

                <div className="col-span-6 flex justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove Item
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              + Add Another Item
            </button>
          </div>

          {/* Discount */}
          <div className="flex justify-between mt-4">
            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium mb-1">Discount (%)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value))}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter Discount"
              />
            </div>

            <div className="w-full max-w-xs">
              <label className="block text-sm font-medium mb-1">Final Total</label>
              <input
                type="text"
                value={`₹${finalTotal.toFixed(2)}`}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-6">
            <button
              type="reset"
              onClick={() => {
                setItems([{ medicineId: '', quantity: 1, unitPrice: 0, availableStock: 0, total: 0 }]);
                setDiscount(0);
                setSelectedCustomer('');
              }}
              className="bg-gray-300 px-4 py-2 rounded mr-4 hover:bg-gray-400"
            >
              Reset
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default InvoiceCreate;
