import React, { useState } from 'react';

const RegisterBabysitter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    availability: '',
    rate: '',
    about: '',
    backgroundCheck: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'backgroundCheck') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // Em breve enviaremos pro backend!
    alert('Babysitter profile submitted!');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Babysitter Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

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

        <input
          type="text"
          name="availability"
          placeholder="Availability (e.g. Mon-Fri, 9am-5pm)"
          value={formData.availability}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <input
          type="number"
          name="rate"
          placeholder="Hourly Rate (NZD)"
          value={formData.rate}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        <textarea
          name="about"
          placeholder="Tell us about yourself"
          value={formData.about}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          rows={4}
          required
        />

        <div>
          <label className="block mb-1 font-medium">Upload Background Check:</label>
          <input
            type="file"
            name="backgroundCheck"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Registration
        </button>
      </form>
    </div>
  );
};

export default RegisterBabysitter;
