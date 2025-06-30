// src/pages/ProfileBabysitter.jsx
import React, { useState, useContext } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileBabysitter = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle profile update (mock for now)
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    try {
      await axios.delete("http://localhost:3000/api/babysitters/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      logout();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
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
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
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
              <label className="block mb-1 text-gray-700 font-medium">
                Available From
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded focus:outline-none"
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">
                Available To
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded focus:outline-none"
              />
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

          {/* Change Password */}
          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">Change Password</h2>
            <input
              type="password"
              placeholder="Current Password"
              className="w-full mb-2 px-4 py-2 border rounded focus:outline-none"
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full mb-2 px-4 py-2 border rounded focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full px-4 py-2 border rounded focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition mt-2"
          >
            Delete Account
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Confirm Account Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfileBabysitter;
