// src/pages/RegisterClient.jsx
import React from 'react';
import { FaUserCircle } from "react-icons/fa";

const RegisterClient = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border">
        <div className="flex flex-col items-center mb-6">
          <UserRound className="h-12 w-12 text-purple-600 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Client Registration</h1>
          <p className="text-sm text-gray-500 text-center">
            Sign up to book trusted babysitters near you.
          </p>
        </div>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Street Address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">Select Region</option>
            <option value="auckland">Auckland</option>
            <option value="wellington">Wellington</option>
            <option value="christchurch">Christchurch</option>
          </select>
          <input
            type="number"
            placeholder="Number of Children"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterClient;
