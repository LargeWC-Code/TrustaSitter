import React, { useState, useContext, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { updateClientProfile, deleteClientAccount } from "../services/api";
import { api } from "../services/api";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { geocodeAddress } from '../services/api';
import { useGoogleMaps } from '../hooks/useGoogleMaps';


const ProfileClient = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isLoaded, isLoading, error: mapsError } = useGoogleMaps();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    children_count: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Fetch client profile data on mount using the token for authentication
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData((prev) => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          children_count: res.data.children_count !== null && res.data.children_count !== undefined ? res.data.children_count.toString() : "",
        }));
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // If address is changed manually, geocode it with debounce
    if (name === 'address' && value.trim()) {
      clearTimeout(window.geocodeTimeout);
      window.geocodeTimeout = setTimeout(() => {
        handleGeocodeAddress(value);
      }, 1000); // Wait 1 second after user stops typing
    }
  };

  // Geocode address to get coordinates
  const handleGeocodeAddress = async (address) => {
    setIsGeocoding(true);
    try {
      const data = await geocodeAddress(address);
      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        const lat = location.lat;
        const lng = location.lng;
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
    setFormData((prev) => ({ 
      ...prev, 
      latitude: lat, 
      longitude: lng,
      address 
    }));
    console.log("Address selected from autocomplete:", { lat, lng, address });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
          setFormError("");

    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setFormError("Please enter your current password to change it.");
        return;
      }
      if (!formData.newPassword || !formData.confirmPassword) {
        setFormError("Please fill in all password fields.");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setFormError("New passwords do not match.");
        return;
      }
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        children_count:
          formData.children_count === "" ? null : parseInt(formData.children_count, 10)
      };
      await updateClientProfile(payload, token);

      if (formData.newPassword) {
        await api.put(
          "/users/profile/password",
          {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      setShowSuccessModal(true);
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setFormError(err.response.data.error);
      } else {
                  setFormError("Failed to update profile.");
      }
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
        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">{formError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Full Name</label>
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              type="text" 
              placeholder="Enter your full name" 
              className="w-full px-4 py-2 border rounded" 
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Email Address</label>
            <input 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              type="email" 
              placeholder="Enter your email address" 
              className="w-full px-4 py-2 border rounded" 
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Phone Number</label>
            <input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              type="text" 
              placeholder="Enter your phone number" 
              className="w-full px-4 py-2 border rounded" 
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Address</label>
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
              placeholder="Enter your home address"
              isGeocoding={isGeocoding}
              hasCoordinates={formData.latitude && formData.longitude}
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Number of Children</label>
            <input 
              name="children_count" 
              value={formData.children_count} 
              onChange={handleChange} 
              type="number" 
              placeholder="How many children do you have?" 
              className="w-full px-4 py-2 border rounded" 
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">Change Password</h2>
            <input name="currentPassword" value={formData.currentPassword} onChange={handleChange} type="password" placeholder="Current Password" className="w-full mb-2 px-4 py-2 border rounded" />
            <input name="newPassword" value={formData.newPassword} onChange={handleChange} type="password" placeholder="New Password" className="w-full mb-2 px-4 py-2 border rounded" />
            <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" placeholder="Confirm New Password" className="w-full px-4 py-2 border rounded" />
          </div>

          <button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition">Save Changes</button>
          <button type="button" onClick={() => setShowConfirm(true)} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition mt-2">Delete Account</button>
        </form>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Confirm Account Deletion</h2>
            <p className="mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Yes, Delete</button>
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
    </main>
  );
};

export default ProfileClient;
