// src/pages/ProfileBabysitter.jsx
import React, { useEffect, useState, useContext } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

import { changeBabysitterPassword } from "../services/api";
import { GoogleMap, Marker } from "@react-google-maps/api";
import axios from "axios";
import AddressAutocomplete from "../components/AddressAutocomplete";

const GOOGLE_API_KEY = "AIzaSyBVW-pAsL7J590t7Y1uM8Y4tlcNvSdy0O4";

const ProfileBabysitter = () => {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rate: "",
    available_days: [],
    available_from: "",
    available_to: "",
    about: "",
    latitude: null,
    longitude: null,
    address: ""
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [marker, setMarker] = useState(null);


  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/babysitters/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          rate: res.data.rate || "",
          available_days: res.data.available_days || [],
          available_from: res.data.available_from || "",
          available_to: res.data.available_to || "",
          about: res.data.about || "",
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          address: res.data.address || ""
        });
        if (res.data.latitude && res.data.longitude) {
          setMarker({ lat: res.data.latitude, lng: res.data.longitude });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [token]);

  // 地图选点和逆地理编码
  async function fetchAddressByLatLng(lat, lng) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&components=country:NZ&key=${GOOGLE_API_KEY}`;
    try {
      const res = await axios.get(url);
      if (res.data.status === "OK") {
        return res.data.results[0].formatted_address;
      }
    } catch (e) {}
    return "";
  }

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    const address = await fetchAddressByLatLng(lat, lng);
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, address }));
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // If address is changed manually, geocode it with debounce
    if (name === 'address' && value.trim()) {
      clearTimeout(window.geocodeTimeout);
      window.geocodeTimeout = setTimeout(() => {
        geocodeAddress(value);
      }, 1000); // Wait 1 second after user stops typing
    }
  };

  // Geocode address to get coordinates
  const geocodeAddress = async (address) => {
    setIsGeocoding(true);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:NZ&key=${GOOGLE_API_KEY}`;
    try {
      const res = await axios.get(url);
      if (res.data.status === "OK") {
        const location = res.data.results[0].geometry.location;
        const lat = location.lat;
        const lng = location.lng;
        setMarker({ lat, lng });
        setFormData((prev) => ({ 
          ...prev, 
          latitude: lat, 
          longitude: lng 
        }));
        console.log("Address geocoded successfully:", { lat, lng });
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = ({ lat, lng, address }) => {
    setMarker({ lat, lng });
    setFormData((prev) => ({ 
      ...prev, 
      latitude: lat, 
      longitude: lng,
      address 
    }));
    console.log("Address selected from autocomplete:", { lat, lng, address });
  };

  const handleCheckboxChange = (day) => {
    setFormData((prev) => {
      const days = prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day];
      return { ...prev, available_days: days };
    });
  };

  // Submit profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        "/babysitters/profile",
        {
          ...formData,
          available_days: formData.available_days
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      await changeBabysitterPassword(token, currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(
        error.response?.data?.error || "Failed to change password."
      );
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete("/babysitters/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account.");
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
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="text"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded"
          />

          <input
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            type="text"
            placeholder="Hourly Rate ($)"
            className="w-full px-4 py-2 border rounded"
          />

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Available Days</label>
            <div className="grid grid-cols-2 gap-2">
              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.available_days.includes(day)}
                    onChange={() => handleCheckboxChange(day)}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available From</label>
              <input
                name="available_from"
                value={formData.available_from}
                onChange={handleChange}
                type="time"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available To</label>
              <input
                name="available_to"
                value={formData.available_to}
                onChange={handleChange}
                type="time"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            placeholder="About Me"
            className="w-full px-4 py-2 border rounded"
            rows="3"
          />

          <AddressAutocomplete
            value={formData.address}
            onChange={(e) => {
              // Create a synthetic event with the correct name
              const syntheticEvent = {
                target: {
                  name: 'address',
                  value: e.target.value
                }
              };
              handleChange(syntheticEvent);
            }}
            onSelect={handleAddressSelect}
            placeholder="Enter your address"
            isGeocoding={isGeocoding}
            hasCoordinates={formData.latitude && formData.longitude}
          />
          <div>
            <label className="block text-gray-700 mb-1">Select your location on the map:</label>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "300px" }}
              center={marker || { lat: -36.8485, lng: 174.7633 }}
              zoom={marker ? 13 : 11}
              onClick={handleMapClick}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
            {marker && (
              <div className="mt-2 text-sm text-gray-600">
                Latitude: {marker.lat.toFixed(6)}, Longitude: {marker.lng.toFixed(6)}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
          >
            Save Changes
          </button>
        </form>

        {/* Change Password */}
          <form
            onSubmit={handleChangePassword}
            className="border-t pt-6 mt-6 space-y-3"
          >
            <h2 className="text-lg font-semibold">Change Password</h2>

            {passwordSuccess && (
              <p className="text-green-600">{passwordSuccess}</p>
            )}
            {passwordError && <p className="text-red-600">{passwordError}</p>}

            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
            >
              Update Password
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition mt-4"
          >
            Delete Account
          </button>

          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                <h2 className="text-xl font-semibold mb-4">
                  Confirm Account Deletion
                </h2>
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

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <FaCheckCircle className="text-green-600 text-2xl" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Changes Saved Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your profile information has been updated and saved.
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                >
                  OK
                </button>
              </div>
            </div>
          )}

      </div>
    </main>
  );
};

export default ProfileBabysitter;
