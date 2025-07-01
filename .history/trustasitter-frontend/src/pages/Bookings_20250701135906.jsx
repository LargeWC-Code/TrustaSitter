// src/pages/Bookings.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getBookingsByUser } from "../services/api";
import { useNavigate } from "react-router-dom";

const Bookings = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings when page loads
  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        const data = await getBookingsByUser(user.id, token);
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user, token]);

  const handleCancel = (id) => {
    // You can implement cancellation here
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <p className="text-lg text-gray-700">Please log in to view your bookings.</p>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-10">
        <span className="text-blue-600">My</span>{" "}
        <span className="text-purple-500">Bookings</span>
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            You have no bookings yet.
          </p>
          <button
            onClick={() => navigate("/search")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded transition"
          >
            Find a Babysitter
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded shadow p-6 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Babysitter: {booking.babysitter_name}
                </h2>
                <p className="text-gray-600 mb-1">
                  <strong>Date:</strong>{" "}
                  {new Date(booking.date).toLocaleDateString("en-NZ", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Time:</strong>{" "}
                  {`${booking.time_start} - ${booking.time_end}`}
                </p>
                <p className="text-gray-600">
                  <strong>Status:</strong>{" "}
                  {booking.status}
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
