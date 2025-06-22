// Page: Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 mt-6">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500">TrustaSitter</span>
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        Easily find trusted and verified babysitters in your area. Book confidently with background-checked professionals.
      </p>
      <Link
        to="/search"
        className="bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white px-6 py-3 rounded-full shadow-lg transition"
      >
        Find Babysitters
      </Link>
    </div>
  );
};

export default Home;
