import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

        {!user && (
          <Link
            to="/login"
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded transition"
          >
            Login
          </Link>
        )}

        {user && (
          <>
            {/* Dashboard link based on role */}
            <Link
              to={user.region ? "/homeclient" : "/home-babysitter"}
              className="text-gray-700 font-semibold px-3 py-2 rounded hover:bg-purple-50 hover:text-purple-600 transition"
            >
              Dashboard
            </Link>

            {/* Profile link based on role */}
            <Link
              to={user.region ? "/profile-client" : "/profile"}
              className="text-gray-700 font-semibold px-3 py-2 rounded hover:bg-purple-50 hover:text-purple-600 transition"
            >
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
