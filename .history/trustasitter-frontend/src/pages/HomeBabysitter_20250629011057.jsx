// src/pages/HomeBabysitter.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const HomeBabysitter = () => {
  // Mock data to simulate upcoming bookings
  const [bookings] = useState([
    {
      id: 1,
      parentName: "Sarah Johnson",
      date: "2024-07-12",
      time: "09:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      parentName: "Michael Brown",
      date: "2024-07-15",
      time: "02:00 PM",
      status: "Pending Approval",
    },
  ]);

  return (
    <main className="bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen py-12 px-6">
      {/* Welcome message */}
      <h1 className="text-3xl font-bold text-center mb-8">
        Welcome back, <span className="text-purple-600">Babysitter!</span>
      </h1>

      {/* Bookings section */}
      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Your Upcoming Bookings
        </h2>

        {bookings.length === 0 ? (
          <p className="text-gray-600">You have no upcoming bookings.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded shadow p-4 flex flex-col justify-between"
              >
                <div>
                  <p className="text-gray-800 font-medium">
                    Parent: {booking.parentName}
                  </p>
                  <p className="text-gray-600">
                    Date: {booking.date}
                  </p>
                  <p className="text-gray-600">
                    Time: {booking.time}
                  </p>
                  <p
                    className={`mt-1 font-semibold ${
                      booking.status === "Confirmed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {booking.status}
                  </p>
                </div>
                {booking.status === "Pending Approval" && (
                  <button className="mt-3 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition">
                    Approve Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/"
          className="bg-white text-purple-600 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
        >
          Back to Home
        </Link>
        <Link
          to="/profile"
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded font-semibold transition"
        >
          Manage Profile
        </Link>
        <Link
          to="/login"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded font-semibold transition"
        >
          Logout
        </Link>
      </div>
    </main>
  );
};

export default HomeBabysitter;
