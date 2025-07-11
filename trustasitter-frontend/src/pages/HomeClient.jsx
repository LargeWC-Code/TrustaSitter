import React, { useContext } from "react";
import { FaSearch, FaCalendarCheck } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const ClientDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-start justify-center pt-24 px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name || "Client"}!
        </h1>
        <p className="text-lg text-gray-700 mb-10">
          Thank you for trusting <strong>TrustaSitter</strong> to help care for what matters most.
          Use the options below to search for available babysitters in your area or review your existing bookings.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            to="/search"
            className="flex items-center gap-3 bg-white border border-gray-300 shadow-md hover:shadow-xl px-6 py-4 rounded-lg transition"
          >
            <FaSearch className="text-blue-600 text-xl" />
            <span className="text-lg font-medium text-gray-700">Find a Babysitter</span>
          </Link>

          <Link
            to="/bookings"
            className="flex items-center gap-3 bg-white border border-gray-300 shadow-md hover:shadow-xl px-6 py-4 rounded-lg transition"
          >
            <FaCalendarCheck className="text-green-600 text-xl" />
            <span className="text-lg font-medium text-gray-700">View My Bookings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
