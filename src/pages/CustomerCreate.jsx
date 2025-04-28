import React, { useState } from 'react';

function CustomerCreate() {
  const [Customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Customer Data:', Customer);

    // TODO: Send to backend via fetch/axios
    setCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
    });
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add a Customer</h1>
        <p className="text-gray-600 mt-1">
          Enter Customer details to manage your medicine purchase sources effectively.
        </p>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Customer Form */}
      <div className="max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block font-medium mb-1">Customer Name</label>
            <input
              type="text"
              name="name"
              value={Customer.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={Customer.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={Customer.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Address</label>
            <textarea
              name="address"
              value={Customer.address}
              onChange={handleChange}
              required
              rows="3"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Add Customer
          </button>
        </form>
      </div>
    </div>
  );
}

export default CustomerCreate;
