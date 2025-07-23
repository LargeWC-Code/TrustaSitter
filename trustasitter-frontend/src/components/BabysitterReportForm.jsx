import React, { useState } from 'react';
import { api } from '../services/api';

const CHECKLIST_OPTIONS = [
  'Fed',
  'Played',
  'Slept',
  'Took medicine',
  'Other',
];

const BabysitterReportForm = ({ bookingId, babysitterId, onReportSent }) => {
  const [checklist, setChecklist] = useState([]);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState(null);
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
    setPhoto(e.target.files[0]);
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
      if (onReportSent) onReportSent(response.data.report);
    } catch (err) {
      setError('Failed to send report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="bg-white rounded shadow p-6 max-w-md mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Send Report to Parents</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Checklist (optional):</label>
        <div className="flex flex-wrap gap-3">
          {CHECKLIST_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={checklist.includes(option)}
                onChange={() => handleChecklistChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Comment (optional):</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Photo (optional):</label>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Report'}
      </button>
      {success && <p className="text-green-600 mt-3">Report sent successfully!</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </form>
  );
};

export default BabysitterReportForm; 