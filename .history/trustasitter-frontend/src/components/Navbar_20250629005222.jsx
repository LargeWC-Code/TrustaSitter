import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="text-xl font-bold">
        <Link to="/" className="text-xl font-bold">
          <span className="text-blue-600">Trusta</span>
          <span className="text-purple-500">Sitter</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-gray-700 font-semibold px-3 py-2 rounded hover:bg-purple-50 hover:text-purple-600 transition"
        >
          Home
        </Link>
        <Link
          to="/search"
          className="text-gray-700 font-semibold px-3 py-2 rounded hover:bg-purple-50 hover:text-purple-600 transition"
        >
          Search
        </Link>
        <Link
          to="/bookings"
          className="text-gray-700 font-semibold px-3 py-2 rounded hover:bg-purple-50 hover:text-purple-600 transition"
        >
          Bookings
        </Link>
        <Link
          to="/login"
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded transition"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
