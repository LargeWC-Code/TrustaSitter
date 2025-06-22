import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-white p-6">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Find the Perfect Babysitter with{' '}
          <span className="text-blue-600">Trusta</span>
          <span className="text-purple-600">Sitter</span>
        </h1>
        <p className="text-gray-600 mb-6">
          Connecting families with trusted, verified babysitters across Auckland.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/search')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Find a Babysitter
          </button>
          <button
            onClick={() => navigate('/register-babysitter')}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            Become a Babysitter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
