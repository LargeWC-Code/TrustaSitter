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
    password: '',
    confirmPassword: '',
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
          <input type="em
