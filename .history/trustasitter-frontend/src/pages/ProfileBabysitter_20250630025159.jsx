// src/pages/ProfileBabysitter.jsx
import React, { useState, useContext } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileBabysitter = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError("Please enter your current password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
    }

    try {
      const payload = {};
      if (newPassword) {
        payload.password = newPassword;
      }

      await axios.put(
        "http://localhost:3000/api/babysitters/profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }

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

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
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

          {/* About */}
          <textarea
            placeholder="About Me"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            rows="3"
          />

          {/* Password Change */}
          <div className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Change Password</h2>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full mb-2 px-4 py-2 border rounded focus:outline-none"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-2 px-4 py-2 border rounded focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            onClick={handleDeleteAccount}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition mt-2"
          >
            Delete Account
          </button>
        </form>
      </div>
    </main>
  );
};

export default ProfileBabysitter;
