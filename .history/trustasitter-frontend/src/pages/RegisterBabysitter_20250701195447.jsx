// src/pages/RegisterBabysitter.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaUserNurse } from "react-icons/fa";

const RegisterBabysitter = () => {
  // Access login context
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    region: "",
    rate: "",
    availableDays: [],
    availableFrom: "",
    availableTo: "",
    about: "",
    profilePicture: null,
    certificates: [],
  });

  // Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle field changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const updatedDays = checked
          ? [...prev.availableDays, value]
          : prev.availableDays.filter((day) => day !== value);
        return { ...prev, availableDays: updatedDays };
      });
    } else if (type === "file") {
      if (name === "certificates") {
        setFormData((prev) => ({ ...prev, certificates: files }));
      } else {
        setFormData((prev) => ({ ...prev, profilePicture: files[0] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.region ||
      !formData.availableFrom ||
      !formData.availableTo ||
      !formData.rate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Create babysitter
      await axios.post("http://localhost:3000/api/babysitters/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        region: formData.region,
        available_days: formData.availableDays.join(","),
        available_from: formData.availableFrom,
        available_to: formData.availableTo,
        about: formData.about,
        rate: formData.rate,
        // For now, profilePicture and certificates are not being sent to backend
      });

      // Auto login
      const loginResponse = await axios.post(
        "http://localhost:3000/api/babysitters/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      login({
        token: loginResponse.data.token,
        user: {
          ...loginResponse.data.babysitter,
          role: "babysitter",
        },
      });

      // Redirect to babysitter home
      navigate("/home-babysitter");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to create account. Please try again."
      );
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-b from-purple-100 via-white to-purple-100 px-4 pt-20 pb-20">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <FaUserNurse className="text-purple-600 text-4xl mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Babysitter Registration</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Please fill out your information to create your profile.
          </p>
        </div>

        {/* Feedback messages */}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-center mb-4">{success}</p>
        )}

        {/* Registration Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          {/* Email */}
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          {/* Password */}
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          {/* Confirm Password */}
          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          {/* Phone */}
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="text"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          {/* Region */}
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
          {/* Rate */}
          <input
            name="rate"
            value={formData.rate}
            onChange={handleChange}
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
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (day) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={day}
                      checked={formData.availableDays.includes(day)}
                      onChange={handleChange}
                    />
                    <span>{day}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Available Hours */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available From</label>
              <input
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                type="time"
                className="w-full px-3 py-2 border rounded focus:outline-none"
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available To</label>
              <input
                name="availableTo"
                value={formData.availableTo}
                onChange={handleChange}
                type="time"
                className="w-full px-3 py-2 border rounded focus:outline-none"
              />
            </div>
          </div>

          {/* About Me */}
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            placeholder="About Me"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            rows="3"
          />

          {/* Profile Picture */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Upload Profile Picture
            </label>
            <input
              type="file"
              name="profilePicture"
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* Certificates */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Upload Certificates
            </label>
            <input
              type="file"
              name="certificates"
              onChange={handleChange}
              className="w-full"
              multiple
            />
          </div>

          {/* Submit */}
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
