import React from 'react';
import { FaSearch, FaCalendarCheck } from 'react-icons/fa';

const ClientDashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome, Rita!</h1>

      <div className="flex flex-col sm:flex-row gap-6">
        <a
          href="/search"
          className="flex items-center gap-3 bg-white border border-gray-300 shadow-lg hover:shadow-xl px-6 py-4 rounded-lg transition"
        >
          <FaSearch className="text-blue-600 text-xl" />
          <span className="text-lg font-medium text-gray-700">Find a Babysitter</span>
        </a>

        <a
          href="/bookings"
          className="flex items-center gap-3 bg-white border border-gray-300 shadow-lg hover:shadow-xl px-6 py-4 rounded-lg transition"
        >
          <FaCalendarCheck className="text-green-600 text-xl" />
          <span className="text-lg font-medium text-gray-700">View My Bookings</span>
        </a>
      </div>
    </div>
  );
};

export default ClientDashboard;
