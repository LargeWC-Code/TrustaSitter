// src/pages/HomeBabysitter.jsx
import React, { useEffect, useState, useContext } from "react";
import { api, sendEmail } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import BabysitterReportForm from '../components/BabysitterReportForm';
import ReportList from '../components/ReportList';
import { FiX } from 'react-icons/fi';

function formatBookingTime(timeString) {
  if (!timeString) return '';
  const [hour, minute] = timeString.split(':');
  return `${hour}:${minute}`;
}

const HomeBabysitter = () => {
  const { token, user, isLoading } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailModal, setEmailModal] = useState({ 
    isOpen: false, 
    clientName: "", 
    clientEmail: "",
    message: "" 
  });
  const [modal, setModal] = useState({ message: "", type: "" });
  const [sendingCountdown, setSendingCountdown] = useState(0);
  const [openReportModal, setOpenReportModal] = useState(null); // bookingId or null

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
    try {
      const response = await api.get(
        `/babysitters/${user.id}/bookings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(response.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setBookings([]); 
      } else {
        setError("Failed to load bookings.");
      }
    } finally {
      setLoading(false);
    }
  };


    fetchBookings();
  }, [token, user]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.put(
        `/babysitters/bookings/${bookingId}/status`,
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

  // Send email handler
  const handleSendEmail = async () => {
    console.log('Token available:', !!token);
    console.log('Token value:', token);
    
    setSendingCountdown(5);
    for (let i = 5; i > 0; i--) {
      setSendingCountdown(i);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    setSendingCountdown(0);
    
    try {
      await sendEmail({
        to: emailModal.clientEmail,
        subject: `Message about booking - ${emailModal.clientName}`,
        message: emailModal.message,
        fromName: "TrustaSitter Bookings"
      }, token);

      // Close email modal first
      setEmailModal({ isOpen: false, clientName: "", clientEmail: "", message: "" });
      
      // Show success message
      setModal({
        message: "Email sent successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Close email modal first
      setEmailModal({ isOpen: false, clientName: "", clientEmail: "", message: "" });
      
      // Show error message
      setModal({
        message: `Failed to send email: ${error.response?.data?.error || error.message || 'Unknown error'}`,
        type: "error",
      });
    }
  };

  if (isLoading || !user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen py-12 px-6 flex flex-col items-center">
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
              Send Email to {emailModal.clientName}
            </h2>
            <textarea
              value={emailModal.message}
              onChange={(e) => setEmailModal(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Write your message here..."
              className="w-full h-32 p-3 border border-gray-300 rounded mb-4 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEmailModal({ isOpen: false, clientName: "", clientEmail: "", message: "" })}
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
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Your Bookings
          </h2>

          {bookings.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>You don't have any bookings yet.</p>
              <p>Once a parent books you, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded shadow p-4 flex flex-col"
                >
                  <div>
                    <p className="text-gray-800 font-medium">
                      Client: {booking.parent_name || "Unknown"}
                    </p>
                    <p className="text-gray-600">
                      Phone: {booking.client_phone || "Not specified"}
                    </p>
                    <p className="text-gray-600">
                      Address: {booking.client_address || "Not specified"}
                    </p>
                    <p className="text-gray-600">
                      Region: {booking.client_region || "Not specified"}
                    </p>
                    <p className="text-gray-600">
                      Children: {booking.client_children !== null ? booking.client_children : "Not specified"}
                    </p>
                    <p className="text-gray-600">
                      Date: {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Time: {formatBookingTime(booking.time_start)} - {formatBookingTime(booking.time_end)}
                    </p>
                    <p className={`mt-1 font-semibold ${
                      booking.status === "approved"
                        ? "text-green-600"
                        : booking.status === "cancelled"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}>
                      {booking.status}
                    </p>
                  </div>
                  {/* Action buttons always directly below status */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setEmailModal({
                        isOpen: true,
                        clientName: booking.parent_name || "Client",
                        clientEmail: booking.client_email || "trustasitter@gmail.com",
                        message: ""
                      })}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                    >
                      Send Email
                    </button>
                    {(booking.status === "pending" || booking.status === "approved") && (
                      <>
                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "approved")}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                  {booking.status === 'approved' && (
                    <>
                      <button
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
                        onClick={() => setOpenReportModal(booking.id)}
                      >
                        Send Report
                      </button>
                      <ReportList bookingId={booking.id} />
                    </>
                  )}
                  {/* Modal for Report Form */}
                  {openReportModal === booking.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white rounded-lg shadow-lg p-0 w-full max-w-lg relative max-h-[90vh] flex flex-col">
                        <button
                          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl z-10 border border-red-200 rounded-full p-1 transition"
                          onClick={() => setOpenReportModal(null)}
                          aria-label="Close"
                          style={{ background: 'rgba(255,255,255,0.8)' }}
                        >
                          <FiX />
                        </button>
                        <div className="overflow-y-auto p-6 flex-1 modal-scrollbar">
                          <BabysitterReportForm
                            bookingId={booking.id}
                            babysitterId={user.id}
                            onReportSent={() => setOpenReportModal(null)}
                          />
                        </div>
                      </div>
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