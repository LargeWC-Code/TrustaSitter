import React, { useState } from 'react';
import { FaUserNurse } from 'react-icons/fa';

const RegisterBabysitter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    availableDays: '',
    availableTimes: '',
    experience: '',
    certifications: [],
    about: '',
    backgroundCheck: null,
    profilePhoto: null,
  });

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      let updatedCerts = [...formData.certifications];
      if (checked) {
        updatedCerts.push(value);
      } else {
        updatedCerts = updatedCerts.filter(cert => cert !== value);
      }
      setFormData({ ...formData, certifications: updatedCerts });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert('Babysitter profile submitted!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-12">
      <div className="w-full max-w-xl bg-white p-8 rounded shadow-md">
        <div className="text-center mb-6">
          <FaUserNurse className="mx-auto text-purple-500 text-4xl mb-2" />
          <h1 className="text-2xl font-bold">Babysitter Registration</h1>
          <p className="text-gray-600 text-sm mt-1">Please fill out your information to create your profile</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
          <select name="region" value={formData.region} onChange={handleChange} required className="w-full border px-4 py-2 rounded">
            <option value="">Select Region</option>
            <option value="Central Auckland">Central Auckland</option>
            <option value="North Shore">North Shore</option>
            <option value="East Auckland">East Auckland</option>
            <option value="South Auckland">South Auckland</option>
            <option value="West Auckland">West Auckland</option>
          </select>
          <input type="text" name="availableDays" placeholder="Available Days (e.g. Mon-Fri)" value={formData.availableDays} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
          <input type="text" name="availableTimes" placeholder="Available Times (e.g. 9am - 5pm)" value={formData.availableTimes} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />
          <input type="number" name="experience" placeholder="Years of Experience" value={formData.experience} onChange={handleChange} required className="w-full border px-4 py-2 rounded" />

          <fieldset className="border border-gray-300 p-4 rounded">
            <legend className="font-semibold text-sm text-gray-700">Certifications (optional)</legend>
            <label className="block text-sm mt-1">
              <input type="checkbox" name="certifications" value="First Aid Certified" onChange={handleChange} className="mr-2" /> First Aid Certified
            </label>
            <label className="block text-sm">
              <input type="checkbox" name="certifications" value="CPR Certified" onChange={handleChange} className="mr-2" /> CPR Certified
            </label>
            <label className="block text-sm">
              <input type="checkbox" name="certifications" value="Childcare Diploma" onChange={handleChange} className="mr-2" /> Childcare Diploma
            </label>
          </fieldset>

          <textarea name="about" placeholder="Tell us about yourself" value={formData.about} onChange={handleChange} rows={4} required className="w-full border px-4 py-2 rounded" />

          <div>
            <label className="block mb-1 font-medium">Upload Background Check:</label>
            <input type="file" name="backgroundCheck" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} required className="w-full" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Upload Profile Photo:</label>
            <input type="file" name="profilePhoto" accept="image/*" onChange={handleChange} required className="w-full" />
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white font-semibold py-2 rounded hover:bg-purple-700 transition">Submit Registration</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterBabysitter;
