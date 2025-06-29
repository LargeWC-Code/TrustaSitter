// src/pages/RegisterBabysitter.jsx
import React from "react";
import { FaUserNurse } from "react-icons/fa";

const RegisterBabysitter = () => {
  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-b from-purple-100 via-white to-purple-100 px-4 pt-20 pb-20">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <FaUserNurse className="text-purple-600 text-4xl mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Babysitter Registration</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Please fill out your information to create your profile.
          </p>
        </div>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <select className="w-full px-4 py-2 border rounded focus:outline-none">
            <option value="">Select Region</option>
            <option value="Central">Central</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>
          <input
            type="text"
            placeholder="Hourly Rate ($)"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />

          {/* Available Days */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Available Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Available Hours */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available From</label>
              <input type="time" className="w-full px-3 py-2 border rounded focus:outline-none" />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available To</label>
              <input type="time" className="w-full px-3 py-2 border rounded focus:outline-none" />
            </div>
          </div>

          {/* About Me */}
          <textarea
            placeholder="About Me"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            rows="3"
          />

          {/* Upload Profile Picture */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Upload Profile Picture
            </label>
            <input type="file" className="w-full" />
          </div>

          {/* Upload Certificates */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Upload Certificates
            </label>
            <input type="file" className="w-full" multiple />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterBabysitter;
