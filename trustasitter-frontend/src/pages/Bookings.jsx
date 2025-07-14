// src/pages/Bookings.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserBookings, sendEmail } from "../services/api";
import { api } from "../services/api";

const Bookings = () => {
  const { user, token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ message: "", type: "" });
  const [emailModal, setEmailModal] = useState({ 
    isOpen: false, 
    babysitterName: "", 
    babysitterEmail: "",
    message: "" 
  });
  const [sendingCountdown, setSendingCountdown] = useState(0);
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

  // Send email handler
  const handleSendEmail = async () => {
    setSendingCountdown(5);
    for (let i = 5; i > 0; i--) {
      setSendingCountdown(i);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    setSendingCountdown(0);
    
    try {
      await sendEmail({
        to: emailModal.babysitterEmail,
        subject: `Message about booking - ${emailModal.babysitterName}`,
        message: emailModal.message,
        fromName: "TrustaSitter Bookings"
      }, token);

      // Close email modal first
      setEmailModal({ isOpen: false, babysitterName: "", babysitterEmail: "", message: "" });
      
      // Show success message
      setModal({
        message: "Email sent successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Close email modal first
      setEmailModal({ isOpen: false, babysitterName: "", babysitterEmail: "", message: "" });
      
      // Show error message
      setModal({
        message: `Failed to send email: ${error.response?.data?.error || error.message || 'Unknown error'}`,
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
      {/* Success/Error Modal */}
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

      {/* Email Modal */}
      {emailModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Send Email to {emailModal.babysitterName}
            </h2>
            <textarea
              value={emailModal.message}
              onChange={(e) => setEmailModal(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Write your message here..."
              className="w-full h-32 p-3 border border-gray-300 rounded mb-4 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEmailModal({ isOpen: false, babysitterName: "", babysitterEmail: "", message: "" })}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition"
                disabled={sendingCountdown > 0}
              >
                {sendingCountdown > 0 ? `Enviando... ${sendingCountdown}` : "Send Email"}
              </button>
            </div>
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
              <div className="flex gap-2 mt-4">
                {booking.status !== "cancelled" && (
                  <>
                    <button
                      onClick={() => setEmailModal({
                        isOpen: true,
                        babysitterName: booking.babysitter_name,
                        babysitterEmail: booking.babysitter_email || "trustasitter@gmail.com",
                        message: ""
                      })}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                    >
                      Send Email
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Bookings;
