import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to your Dashboard</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Find your perfect babysitter or review your bookings.
      </p>
      <div className="flex flex-col md:flex-row gap-6">
        <button
          onClick={() => navigate('/search')}
          className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg shadow hover:bg-blue-700 transition"
        >
          Find a Babysitter
        </button>
        <button
          onClick={() => navigate('/bookings')}
          className="bg-purple-600 text-white px-6 py-3 rounded-md text-lg shadow hover:bg-purple-700 transition"
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
};

export default ClientDashboard;
