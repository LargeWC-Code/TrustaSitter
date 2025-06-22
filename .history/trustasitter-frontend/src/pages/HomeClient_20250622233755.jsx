import React from 'react';
import { Link } from 'react-router-dom';

export default function HomeClient() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          Welcome back, Rita! 👋
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Find the perfect babysitter in your area with just a few clicks.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            to="/search"
            className="bg-purple-600 text-white font-semibold py-3 px-6 rounded hover:bg-purple-700 transition duration-200"
          >
            🔍 Search Babysitters
          </Link>
          <Link
            to="/bookings"
            className="bg-blue-500 text-white font-semibold py-3 px-6 rounded hover:bg-blue-600 transition duration-200"
          >
            📅 View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
