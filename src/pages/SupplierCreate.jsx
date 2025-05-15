import React, { useState } from 'react';

function SupplierCreate() {
  const [supplier, setSupplier] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error on change
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!supplier.name.trim()) newErrors.name = "Name is required.";
    if (!supplier.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!supplier.email.trim()) newErrors.email = "Email is required.";
    if (!supplier.address.trim()) newErrors.address = "Address is required.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/supplier/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(supplier),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Something went wrong");
      }

      const result = await response.json();
      console.log("Supplier added:", result);
      alert("Supplier added successfully");

      setSupplier({ name: "", phone: "", email: "", address: "" });
      setErrors({});
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add a Supplier</h1>
        <p className="text-gray-600 mt-1">
          Enter supplier details to manage your medicine purchase sources effectively.
        </p>
        <hr className="mt-4 border-gray-300" />
      </div>

      <div className="max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Supplier Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'phone', 'email', 'address'].map((field) => (
            <div key={field}>
              <label className="block font-medium mb-1 capitalize">
                {field === 'name' ? 'Supplier Name' : field === 'phone' ? 'Phone Number' : field === 'email' ? 'Email Address' : 'Address'}
              </label>
              {field === 'address' ? (
                <textarea
                  name={field}
                  value={supplier[field]}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                ></textarea>
              ) : (
                <input
                  type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  name={field}
                  value={supplier[field]}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                />
              )}
              {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Add Supplier
          </button>
        </form>
      </div>
    </div>
  );
}

export default SupplierCreate;
