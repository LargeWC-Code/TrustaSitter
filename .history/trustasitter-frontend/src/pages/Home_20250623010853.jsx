export default function Home() {
  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold text-purple-600">Welcome to TrustaSitter</h1>
      <p className="text-gray-700 mt-4">
        Easily find trusted and verified babysitters in your area.
      </p>
      <button className="mt-6 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
        Find Babysitters
      </button>
    </div>
  );
}
// src/pages/Home.jsx

import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-purple-700 mb-4">
        Welcome to <span className="text-purple-500">TrustaSitter</span>
      </h1>
      <p className="text-gray-700 text-lg mb-8 max-w-xl">
        Easily find trusted, verified, and nearby babysitters in your area. 
        Your peace of mind starts here.
      </p>
      <Link
        to="/search"
        className="bg-purple-500 hover:bg-purple-600 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
      >
        Find a Babysitter
      </Link>
    </div>
  );
}

export default Home;
