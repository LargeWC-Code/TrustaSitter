// src/pages/Bookings.jsx
import React, { useState } from "react";

const Bookings = () => {
  // Mock data to simulate user bookings
  const [bookings, setBookings] = useState([
    {
      id: 1,
      babysitter: "Anna Smith",
      date: "2024-07-10",
      time: "09:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      babysitter: "James Brown",
      date: "2024-07-12",
      time: "02:00 PM",
      status: "Pending",
    },
    {
      id: 3,
      babysitter: "Lisa Johnson",
      date: "2024-07-15",
      time: "06:00 PM",
      status: "Confirmed",
    },
  ]);

  // Handle booking cancellation
  const handleCancel = (id) => {
    // For now, just remove booking from mock list
    const updatedBookings = bookings.filter((booking) => booking.id !== id);
    setBookings(updatedBookings);
  };

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      {/* Page title */}
      <h1 className="text-4xl font-bold text-center mb-10">
        <span className="text-blue-600">My</span>{" "}
        <span className="text-purple-500">Bookings</span>
      </h1>

      {/* If no bookings */}
      {bookings.length === 0 ? (
        <p className="text-center text-gray-600">
          You have no bookings yet.
        </p>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded shadow p-6 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Babysitter: {booking.babysitter}
                </h2>
                <p className="text-gray-600 mb-1">
                  <strong>Date:</strong> {booking.date}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Time:</strong> {booking.time}
                </p>
                <p className="text-gray-600">
                  <strong>Status:</strong> {booking.status}
                </p>
              </div>
              <button
                onClick={() => handleCancel(booking.id)}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Bookings;
