// src/pages/ProfileBabysitter.jsx
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

const ProfileBabysitter = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock: show success message
    setShowSuccess(true);
    // Hide message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen py-12 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Manage Your Profile
      </h1>

      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center flex items-center justify-center gap-2">
            <FaCheckCircle />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
};

export default ProfileBabysitter;
