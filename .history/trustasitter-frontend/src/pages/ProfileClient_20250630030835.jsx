// src/pages/ProfileClient.jsx
import React, { useState, useContext } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileClient = () => {
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

  // Confirm account deletion
  const confirmDelete = async () => {
    try {
      await axios.delete("http://localhost:3000/api/users/profile", {
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
      <h1 className="text-3xl font-bold text-center mb-8">Manage Your Profile</h1>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
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

export default ProfileClient;
