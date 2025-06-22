import React from 'react';

const Home = () => {
  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      {/* Introdução centralizada */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-blue-600">Trusta</span>
          <span className="text-purple-500">Sitter</span>
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Your trusted babysitter finder in Auckland. Safe, fast, and reliable.
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Find a Babysitter
          </button>
          <button className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 transition">
            View Bookings
          </button>
        </div>
      </div>

      {/* Sessão visual com destaques */}
      <div className="mt-20 max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2 text-blue-600">Verified Babysitters</h3>
          <p className="text-gray-600">All sitters pass background checks and experience reviews.</p>
        </div>
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2 text-purple-500">Easy Booking</h3>
          <p className="text-gray-600">Book babysitting sessions in just a few clicks.</p>
        </div>
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2 text-blue-600">Local Matches</h3>
          <p className="text-gray-600">Find sitters in your region based on your preferences.</p>
        </div>
      </div>
    </main>
  );
};

export default Home;
