import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import pharmizeLogo from "@/assets/pharmize.png"; // ✅ Import your logo

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setAuthError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAuthError("");

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }

      localStorage.setItem("token", data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
            <img src={pharmizeLogo} alt="Pharmize" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold">Pharmize</h2>
        </div>
        <p className="text-sm text-gray-500 text-center mb-6">Login to your admin panel</p>
        <hr className="mb-6" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {authError && (
            <p className="text-red-600 text-sm text-center">{authError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <div className="fixed bottom-5 right-10 z-50">
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger className="text-sm text-blue-700 underline cursor-pointer">
            start-demo
          </HoverCardTrigger>
          <HoverCardContent className="w-64 text-sm">
            <p className="font-semibold mb-1">To check admin demo:</p>
            <p><span className="font-medium">Email:</span> admin@pharmize.com</p>
            <p><span className="font-medium">Password:</span> 123456admin</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

export default LoginPage;
