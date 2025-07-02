// src/pages/RegisterBabysitter.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserNurse } from "react-icons/fa";
import axios from "axios";

const RegisterBabysitter = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    region: "",
    availableDays: [],
    availableFrom: "",
    availableTo: "",
    about: "",
    rate: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox for available days
  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const updatedDays = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: updatedDays };
    });
  };

  // Handle form submission
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      // 1) Register the babysitter
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
      });

      // 2) Login automatically
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

      // 3) Navigate to babysitter dashboard
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
        <div className="flex flex-col items-center mb-6">
          <FaUserNurse className="text-purple-600 text-4xl mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Babysitter Registration</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Please fill out your information to create your profile.
          </p>
        </div>

        {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
        {success && <p className="mb-4 text-green-600 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            type="email"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded"
          />
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select Region</option>
            <option value="Central">Central</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>
          <input
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            placeholder="Hourly Rate ($)"
            className="w-full px-4 py-2 border rounded"
          />

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Available Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.availableDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
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
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                type="time"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available To</label>
              <input
                name="availableTo"
                value={formData.availableTo}
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
            rows="3"
            className="w-full px-4 py-2 border rounded"
          />

          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-2 border rounded"
          />
          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            type="password"
            className="w-full px-4 py-2 border rounded"
          />

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
