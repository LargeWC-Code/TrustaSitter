// src/pages/Bookings.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserBookings } from "../services/api";

const Bookings = () => {
  const { user, token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const data = await getUserBookings(user.id, token);
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, token]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading your bookings...</p>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-10">
        <span className="text-blue-600">My</span>{" "}
        <span className="text-purple-500">Bookings</span>
      </h1>

      {bookings.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>You don’t have any bookings yet.</p>
          <button
            onClick={() => navigate("/search")}
            className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded transition"
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
                  {booking.time_start.slice(0,5)} - {booking.time_end.slice(0,5)}
                </p>
                <p className="text-gray-600">
                  <strong>Status:</strong>{" "}
                  {booking.status}
                </p>
              </div>
              <button
                onClick={() => alert("Cancel booking logic here")}
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
