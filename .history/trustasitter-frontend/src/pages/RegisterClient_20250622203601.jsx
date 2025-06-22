import React, { useState } from 'react';

const RegisterClient = () => {
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    childrenCount: '',
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert('Client registered successfully!');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-6">Client Registration</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        {/* Phone */}
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        {/* Address */}
        <input
          type="text"
          name="address"
          placeholder="Street Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        {/* Region */}
        <select
          name="region"
          value={formData.region}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        >
          <option value="">Select Region</option>
          <option value="Central Auckland">Central Auckland</option>
          <option value="North Shore">North Shore</option>
          <option value="East Auckland">East Auckland</option>
          <option value="South Auckland">South Auckland</option>
          <option value="West Auckland">West Auckland</option>
        </select>

        {/* Number of Children */}
        <input
          type="number"
          name="childrenCount"
          placeholder="Number of Children"
          value={formData.childrenCount}
          onChange={handleChange}
          min="1"
          className="w-full border px-4 py-2 rounded"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white font-semibold py-2 rounded hover:bg-purple-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterClient;
