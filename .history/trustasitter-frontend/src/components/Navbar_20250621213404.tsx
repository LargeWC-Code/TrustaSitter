import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Trusta<span className="text-purple-500">Sitter</span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
          <Link to="/" className="hover:text-purple-600 font-medium">Home</Link>
          <Link to="/search" className="hover:text-purple-600 font-medium">Search</Link>
          <Link to="/bookings" className="hover:text-purple-600 font-medium">Bookings</Link>
          <Link to="/login" className="hover:text-purple-600 font-medium">Login</Link>
          <Link to="/register" className="hover:text-purple-600 font-medium">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
