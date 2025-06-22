// Page: Home
import React from 'react';

const Home = () => {
  return (
    <div>
      <h1>Welcome to TrustaSitter</h1>
      <p>Find trusted babysitters in your area.</p>
    </div>
  );
};

export default Home;
const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500">TrustaSitter</span>
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        Easily find trusted and verified babysitters in your area. Book confidently with background-checked professionals.
      </p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition">
        Find Babysitters
      </button>
    </div>
  );
};

export default Home;
