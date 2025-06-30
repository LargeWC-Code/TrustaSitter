// src/pages/Bookings.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Bookings = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // Not logged in
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/bookings/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(res.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, token, navigate]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
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
        <p className="text-center text-gray-600">You have no bookings yet.</p>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow p-6 flex flex-col justify-between"
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
                  <strong>Status:</strong> {booking.status}
                </p>
              </div>
              {/* You could add cancellation logic here */}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Bookings;
