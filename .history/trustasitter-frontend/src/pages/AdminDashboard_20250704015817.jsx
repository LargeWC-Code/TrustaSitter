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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    if (!window.confirm(`Are you sure you want to set status to "${newStatus}"?`)) {
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/admin/bookings/${bookingId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh bookings list
      const response = await axios.get("http://localhost:3000/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data);

      alert(`Booking status updated to "${newStatus}".`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update booking status.");
    }
  };

  // Function to delete a booking
  const deleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh bookings list
      const response = await axios.get("http://localhost:3000/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data);

      alert("Booking deleted successfully.");
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("Failed to delete booking.");
    }
  };

  // Function to delete a user or babysitter
  const deleteUser = async (role, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${role}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh users list
      const response = await axios.get("http://localhost:3000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);

      alert(`${role} deleted successfully.`);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };
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

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold text-gray-800">Clients</h2>
          <p className="text-3xl text-purple-600">{summary.usersCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold text-gray-800">Babysitters</h2>
          <p className="text-3xl text-purple-600">{summary.babysittersCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold text-gray-800">Total Bookings</h2>
          <p className="text-3xl text-purple-600">{summary.bookingsCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold text-gray-800">Pending Bookings</h2>
          <p className="text-3xl text-purple-600">{summary.pendingBookings}</p>
        </div>
      </div>

      {/* Bookings Table */}
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
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-purple-50">
                    <td className="py-2 px-4 border">{booking.id}</td>
                    <td className="py-2 px-4 border">{booking.client_name}</td>
                    <td className="py-2 px-4 border">{booking.babysitter_name}</td>
                    <td className="py-2 px-4 border">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border capitalize">{booking.status}</td>
                    <td className="py-2 px-4 border space-x-2">
                      <button
                        onClick={() =>
                          setConfirmModal({
                            visible: true,
                            title: "Approve Booking",
                            message: "Are you sure you want to approve this booking?",
                            onConfirm: () => updateBookingStatus(booking.id, "approved"),
                          })
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Approve
                      </button>

                        onClick={() => updateBookingStatus(booking.id, "cancelled")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteBooking(booking.id)}
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

      {/* Users Table */}
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
                {users.map((user) => (
                  <tr key={`${user.role}-${user.id}`} className="hover:bg-purple-50">
                    <td className="py-2 px-4 border">{user.id}</td>
                    <td className="py-2 px-4 border">{user.name}</td>
                    <td className="py-2 px-4 border">{user.email}</td>
                    <td className="py-2 px-4 border capitalize">{user.role}</td>
                    <td className="py-2 px-4 border">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => deleteUser(user.role, user.id)}
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
  );
};

export default AdminDashboard;
