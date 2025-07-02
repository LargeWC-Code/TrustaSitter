// src/pages/HomeBabysitter.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaCalendarAlt } from "react-icons/fa"; // Icon for empty state

const HomeBabysitter = () => {
  const { token, user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch bookings when component mounts
    useEffect(() => {
  // Wait until user is loaded
  if (!user) return;

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/babysitters/${user.id}/bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  fetchBookings();
}, [token, user]);


  // Function to approve or reject a booking
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:3000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      setSuccessMessage(`Booking ${newStatus} successfully.`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update booking status.");
    }
  };

  return (
        <main className="bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen py-12 px-6 flex flex-col items-center">
      {/* Welcome */}
      <h1 className="text-3xl font-bold text-center mb-8">
        Welcome back,
        {user?.name && (
          <span className="text-purple-600"> {user.name}!</span>
        )}
      </h1>


      {loading ? (
        <p className="text-center text-gray-600">Loading bookings...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <section className="w-full max-w-4xl mb-12">
          {successMessage && (
            <div className="mb-4 bg-green-100 text-green-700 p-3 rounded text-center">
              {successMessage}
            </div>
          )}

          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Your Upcoming Bookings
          </h2>

          {bookings.length === 0 ? (
            <div className="text-center text-gray-600 flex flex-col items-center">
              <p className="mb-2">You don’t have any bookings yet.</p>
              <p className="">Once a parent books you, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded shadow p-4 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-gray-800 font-medium">
                      Parent: {booking.parent_name || "Unknown"}
                    </p>
                    <p className="text-gray-600">
                      Date: {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Time: {booking.time_start} - {booking.time_end}
                    </p>
                    <p
                      className={`mt-1 font-semibold ${
                        booking.status === "confirmed"
                          ? "text-green-600"
                          : booking.status === "cancelled"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {booking.status}
                    </p>
                  </div>
                  {booking.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>

  );
};

export default HomeBabysitter;
