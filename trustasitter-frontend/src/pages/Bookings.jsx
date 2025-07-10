// src/pages/Bookings.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserBookings } from "../services/api";
import { api } from "../services/api";

const Bookings = () => {
  const { user, token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ message: "", type: "" });
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

  // Cancel booking handler
  const handleCancelBooking = async (bookingId) => {
  try {
    await api.put(
      `/bookings/${bookingId}/status`,
      { status: "cancelled" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );

    setModal({
      message: "Booking cancelled successfully.",
      type: "success",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error.response || error);
    setModal({
      message: "Failed to cancel booking.",
      type: "error",
    });
  }
};


  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading your bookings...</p>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6 relative">
      {/* Modal */}
      {modal.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              {modal.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="text-gray-600 mb-4">{modal.message}</p>
            <button
              onClick={() => setModal({ message: "", type: "" })}
              className={`px-4 py-2 rounded ${
                modal.type === "success"
                  ? "bg-purple-500 hover:bg-purple-600"
                  : "bg-red-500 hover:bg-red-600"
              } text-white transition`}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
                  {booking.time_start.slice(0, 5)} - {booking.time_end.slice(0, 5)}
                </p>
                <p className="text-gray-600">
                  <strong>Status:</strong>{" "}
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </p>
              </div>
              {booking.status !== "cancelled" && (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Bookings;
