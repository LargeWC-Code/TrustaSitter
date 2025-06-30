import React, { useState, useContext } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { updateClientProfile, deleteClientAccount } from "../services/api";
import axios from "axios";

const ProfileClient = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    region: "",
    children: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError("Please enter your current password to change it.");
        return;
      }
      if (!formData.newPassword || !formData.confirmPassword) {
        setError("Please fill in all password fields.");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
    }

    try {
      // Update profile info
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        region: formData.region,
        children: formData.children,
      };
      await updateClientProfile(payload, token);

      // Update password if provided
      if (formData.newPassword) {
        await axios.put(
          "http://localhost:3000/api/users/profile/password",
          {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setShowSuccess(true);
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteClientAccount(token);
      logout();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  return (
    <main className="bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen py-12 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Your Profile</h1>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
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
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="text"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none"
          >
            <option value="">Select Region</option>
            <option value="Central">Central</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>
          <input
            name="children"
            value={formData.children}
            onChange={handleChange}
            type="number"
            placeholder="Number of Children"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />

          {/* Change Password */}
          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">Change Password</h2>
            <input
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              type="password"
              placeholder="Current Password"
              className="w-full mb-2 px-4 py-2 border rounded focus:outline-none"
            />
            <input
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              type="password"
              placeholder="New Password"
              className="w-full mb-2 px-4 py-2 border rounded focus:outline-none"
            />
            <input
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
