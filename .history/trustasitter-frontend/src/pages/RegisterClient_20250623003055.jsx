// src/pages/RegisterClient.jsx
import React from "react";
import { FaUser } from "react-icons/fa";

const RegisterClient = () => {
  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-b from-purple-100 via-white to-purple-100 px-4 pt-20">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <FaUser className="text-purple-600 text-4xl mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Client Registration</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Fill in your details to start booking trusted babysitters in your area.
          </p>
        </div>
        <form className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded-md focus:outline-none" />
          <input type="email" placeholder="Email Address" className="w-full px-4 py-2 border rounded-md focus:outline-none" />
          <input type="text" placeholder="Phone Number" className="w-full px-4 py-2 border rounded-md focus:outline-none" />
          <input type="text" placeholder="Street Address" className="w-full px-4 py-2 border rounded-md focus:outline-none" />
          <select className="w-full px-4 py-2 border rounded-md focus:outline-none">
            <option value="">Select Region</option>
            <option value="central">Central</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="north">North</option>
            <option value="south">South</option>
          </select>
          <input type="number" placeholder="Number of Children" className="w-full px-4 py-2 border rounded-md focus:outline-none" />
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterClient;
