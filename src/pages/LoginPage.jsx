import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Login failed");

      // ✅ Store token
      localStorage.setItem("token", data.access_token);

      // ✅ Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-1">Welcome Back</h2>
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
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

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

      {/* HoverCard fixed at bottom right */}
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
