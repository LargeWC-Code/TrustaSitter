import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/" className="flex items-center space-x-1">
          <span className="text-blue-600">Trusta</span>
          <span className="text-purple-500">Sitter</span>
        </Link>
      </div>
      <div className="space-x-6">
        <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
        <Link to="/search" className="text-gray-700 hover:text-blue-600">Search</Link>
        <Link to="/bookings" className="text-gray-700 hover:text-blue-600">Bookings</Link>
        <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
        <Link to="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;
