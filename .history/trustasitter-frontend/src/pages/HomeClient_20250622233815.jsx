// src/pages/HomeClient.jsx
import React from 'react';

const HomeClient = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-6 text-gray-800">
      <div className="text-center max-w-2xl">
        <img
          src="/logo.png"
          alt="TrustaSitter Logo"
          className="mx-auto mb-8 w-32 h-32"
        />
        <h1 className="text-4xl font-bold mb-4">Welcome to TrustaSitter</h1>
        <p className="text-lg mb-6">
          Your trusted platform to find reliable babysitters near you.
          Book with confidence, connect with verified professionals, and
          enjoy peace of mind while you're away.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/search"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Find a Babysitter
          </a>
          <a
            href="/register"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Register as a Client
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeClient;
