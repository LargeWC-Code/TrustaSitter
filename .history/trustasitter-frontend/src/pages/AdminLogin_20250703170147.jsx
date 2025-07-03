import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LockClosedIcon, MailIcon } from "@heroicons/react/solid";

import axios from "axios";

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
      const response = await axios.post("http://localhost:3000/api/admin/login", {
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
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-100 via-white to-rose-200">
      <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-rose-200 transition-transform transform hover:scale-[1.02]">
        <h2 className="text-3xl font-extrabold text-center mb-2 text-rose-600">
          Welcome, Admin
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Secure access to your dashboard.
        </p>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Email address"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg font-semibold shadow-lg transform hover:-translate-y-0.5 transition"
          >
            Login as Admin
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;
