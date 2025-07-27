import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/admin/login", {
        email,
        password,
      });

      const data = response.data;

      login({
        token: data.token,
        user: data.user,
        role: "admin",
      });

      navigate("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-pink-100">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-pink-600">
          Admin Access
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Please log in to manage the platform.
        </p>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold transition"
          >
            Login as Admin
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;
