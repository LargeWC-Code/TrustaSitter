import React, { useState } from 'react';
import { api } from '../services/api';
import { FaUtensils, FaGamepad, FaBed, FaPills, FaRegEdit } from 'react-icons/fa';

const CHECKLIST_OPTIONS = [
  { label: 'Fed', icon: <FaUtensils className="inline mr-1 text-blue-500" /> },
  { label: 'Played', icon: <FaGamepad className="inline mr-1 text-green-500" /> },
  { label: 'Slept', icon: <FaBed className="inline mr-1 text-purple-500" /> },
  { label: 'Took medicine', icon: <FaPills className="inline mr-1 text-pink-500" /> },
  { label: 'Other', icon: <FaRegEdit className="inline mr-1 text-gray-500" /> },
];

const BabysitterReportForm = ({ bookingId, babysitterId, onReportSent }) => {
  const [checklist, setChecklist] = useState([]);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChecklistChange = (option) => {
    setChecklist((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('booking_id', bookingId);
      formData.append('babysitter_id', babysitterId);
      formData.append('checklist', checklist.join(','));
      formData.append('comment', comment);
      if (photo) {
        formData.append('photo', photo);
      }
      const response = await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setChecklist([]);
      setComment('');
      setPhoto(null);
      setPhotoPreview(null);
      if (onReportSent) onReportSent(response.data.report);
    } catch (err) {
      setError('Failed to send report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-2xl shadow-2xl p-8 max-w-lg mx-auto animate-fade-in" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">Send Report to Parents</h2>
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-gray-700">Checklist (optional):</label>
        <div className="flex flex-wrap gap-4">
          {CHECKLIST_OPTIONS.map((option) => (
            <label key={option.label} className={`flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer border transition ${checklist.includes(option.label) ? 'bg-purple-100 border-purple-400' : 'bg-white border-gray-300 hover:border-purple-300'}`}>
              <input
                type="checkbox"
                checked={checklist.includes(option.label)}
                onChange={() => handleChecklistChange(option.label)}
                className="accent-purple-600"
              />
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-gray-700">Comment (optional):</label>
        <textarea
          className="w-full border-2 border-purple-200 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400 transition"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Write your feedback here..."
        />
      </div>
      <div className="mb-6">
        <label className="block font-semibold mb-2 text-gray-700">Photo (optional):</label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="mb-2" />
        {photoPreview && (
          <div className="mb-2 flex justify-center">
            <img src={photoPreview} alt="Preview" className="h-32 w-32 object-cover rounded-xl shadow-md border-2 border-purple-200" />
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-3">
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl shadow-lg font-bold text-lg transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              Sending...
            </span>
          ) : 'Send Report'}
        </button>
        {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg shadow text-center w-full">Report sent successfully!</div>}
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow text-center w-full">{error}</div>}
      </div>
    </form>
  );
};

export default BabysitterReportForm; 