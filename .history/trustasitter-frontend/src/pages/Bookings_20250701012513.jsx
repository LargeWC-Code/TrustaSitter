import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Bookings = () => {
  const { user, token, isLoading } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // Wait until AuthContext is loaded
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/bookings/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [user, token, isLoading, navigate]);

  if (isLoading || loadingBookings) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading bookings...</p>
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
        <div className="text-center">
          <p className="text-gray-600 mb-4">You have no bookings yet.</p>
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
                  <strong>Date:</strong> {booking.date}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Time:</strong> {booking.time_start} - {booking.time_end}
                </p>
                <p className="text-gray-600">
                  <strong>Status:</strong>{" "}
                  {booking.status ? booking.status : "Pending"}
                </p>
              </div>
              <button
                onClick={() => alert("Cancel functionality not implemented yet.")}
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
