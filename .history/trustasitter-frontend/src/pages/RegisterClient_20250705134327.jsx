// src/pages/RegisterClient.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaUser } from "react-icons/fa";
import { registerClient } from "../services/api";

const RegisterClient = () => {
  const navigate = useNavigate();
  const {login} = useContext(AuthContext);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    region: "",
    children: "",
    password: "",
    confirmPassword: "",
  });

  // Success and error messages
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Call API to register client
      const response = await registerClient({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        region: formData.region,
        children: formData.children_count,
      });

      if (response.token) {
        login({
          token: response.token,
          user: response.user,
          role: "user",
        });
        navigate("/homeclient");
        return;
      }
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to create account. Please try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-100 px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Icon and title */}
        <div className="flex flex-col items-center mb-6">
          <FaUser className="text-purple-600 text-4xl mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Client Registration</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Fill in your details to start booking trusted babysitters in your area.
          </p>
        </div>

        {/* Success message */}
        {success && (
          <p className="mb-4 text-green-600 text-center">{success}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="mb-4 text-red-500 text-center">{error}</p>
        )}

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street Address"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          >
            <option value="">Select Region</option>
            <option value="Central">Central</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>
          <input
            type="number"
            name="children"
            value={formData.children}
            onChange={handleChange}
            placeholder="Number of Children"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterClient;
