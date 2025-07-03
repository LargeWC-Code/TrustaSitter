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
                    <td className="py-2 px-4 border">{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {booking.status !== "approved" && (
                  <button
                    onClick={() => updateBookingStatus(booking.id, "approved")}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Approve
                  </button>
                )}
                {booking.status !== "cancelled" && (
                  <button
                    onClick={() => updateBookingStatus(booking.id, "cancelled")}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
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
