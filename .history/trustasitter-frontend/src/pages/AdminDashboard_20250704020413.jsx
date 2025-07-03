import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);

  // State for summary data
  const [summary, setSummary] = useState({
    usersCount: 0,
    babysittersCount: 0,
    bookingsCount: 0,
    pendingBookings: 0,
  });

  // State for bookings list
  const [bookings, setBookings] = useState([]);

  // State for users list
  const [users, setUsers] = useState([]);

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // State for confirm modal
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Fetch summary data when component mounts
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(response.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  // Fetch bookings when component mounts
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(response.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };
    fetchBookings();
  }, [token]);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [token]);

  // Function to update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:3000/api/admin/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh bookings
      const res = await axios.get("http://localhost:3000/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
      alert(`Booking status updated to "${newStatus}".`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update booking status.");
    }
  };

  // Function to delete booking
  const deleteBooking = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:3000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await axios.get("http://localhost:3000/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
      alert("Booking deleted successfully.");
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("Failed to delete booking.");
    }
  };

  // Function to delete user
  const deleteUser = async (role, id) => {
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${role}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await axios.get("http://localhost:3000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      alert(`${role} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </main>
    );
  }

  return (
    <>
      {/* Confirm Modal */}
      {confirmModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-center">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">{confirmModal.title}</h2>
            <p className="text-gray-600 mb-4">{confirmModal.message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setConfirmModal({ visible: false })}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ visible: false });
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Clients", count: summary.usersCount },
            { label: "Babysitters", count: summary.babysittersCount },
            { label: "Total Bookings", count: summary.bookingsCount },
            { label: "Pending Bookings", count: summary.pendingBookings },
          ].map((item) => (
            <div key={item.label} className="bg-white p-4 rounded shadow text-center">
              <h2 className="text-xl font-semibold text-gray-800">{item.label}</h2>
              <p className="text-3xl text-purple-600">{item.count}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="bg-white p-4 rounded shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-600">No bookings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="py-2 px-4 border">ID</th>
                    <th className="py-2 px-4 border">Client</th>
                    <th className="py-2 px-4 border">Babysitter</th>
                    <th className="py-2 px-4 border">Date</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-purple-50">
                      <td className="py-2 px-4 border">{b.id}</td>
                      <td className="py-2 px-4 border">{b.client_name}</td>
                      <td className="py-2 px-4 border">{b.babysitter_name}</td>
                      <td className="py-2 px-4 border">{new Date(b.date).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border capitalize">{b.status}</td>
                      <td className="py-2 px-4 border space-x-2">
                        <button
                          onClick={() =>
                            setConfirmModal({
                              visible: true,
                              title: "Approve Booking",
                              message: "Are you sure you want to approve this booking?",
                              onConfirm: () => updateBookingStatus(b.id, "approved"),
                            })
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              visible: true,
                              title: "Cancel Booking",
                              message: "Are you sure you want to cancel this booking?",
                              onConfirm: () => updateBookingStatus(b.id, "cancelled"),
                            })
                          }
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              visible: true,
                              title: "Delete Booking",
                              message: "Are you sure you want to delete this booking?",
                              onConfirm: () => deleteBooking(b.id),
                            })
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Users */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Users</h2>
          {users.length === 0 ? (
            <p className="text-gray-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="py-2 px-4 border">ID</th>
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Role</th>
                    <th className="py-2 px-4 border">Created At</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={`${u.role}-${u.id}`} className="hover:bg-purple-50">
                      <td className="py-2 px-4 border">{u.id}</td>
                      <td className="py-2 px-4 border">{u.name}</td>
                      <td className="py-2 px-4 border">{u.email}</td>
                      <td className="py-2 px-4 border capitalize">{u.role}</td>
                      <td className="py-2 px-4 border">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border">
                        <button
                          onClick={() =>
                            setConfirmModal({
                              visible: true,
                              title: "Delete User",
                              message: `Are you sure you want to delete this ${u.role}?`,
                              onConfirm: () => deleteUser(u.role, u.id),
                            })
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
