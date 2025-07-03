import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    users: 0,
    babysitters: 0,
    bookings: 0,
    pendingBookings: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Future: fetch data from API
    // For now, use mock data
    setSummary({
      users: 5,
      babysitters: 3,
      bookings: 12,
      pendingBookings: 2,
    });

    setBookings([
      {
        id: 1,
        client: "John Doe",
        babysitter: "Jane Smith",
        date: "2024-08-15",
        status: "pending",
      },
    ]);

    setUsers([
      { id: 1, name: "John Doe", email: "john@example.com", role: "user" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "babysitter" },
    ]);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500">Clients</p>
          <p className="text-2xl font-bold">{summary.users}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500">Babysitters</p>
          <p className="text-2xl font-bold">{summary.babysitters}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold">{summary.bookings}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500">Pending Bookings</p>
          <p className="text-2xl font-bold">{summary.pendingBookings}</p>
        </div>
      </div>

      {/* Bookings Table */}
      <h2 className="text-xl font-semibold mb-2">Bookings</h2>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Client</th>
              <th className="py-2 px-4 border-b">Babysitter</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="py-2 px-4 border-b">{booking.client}</td>
                <td className="py-2 px-4 border-b">{booking.babysitter}</td>
                <td className="py-2 px-4 border-b">{booking.date}</td>
                <td className="py-2 px-4 border-b capitalize">{booking.status}</td>
                <td className="py-2 px-4 border-b">
                  <button className="bg-green-500 text-white px-2 py-1 rounded mr-2">
                    Approve
                  </button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded">
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Users Table */}
      <h2 className="text-xl font-semibold mb-2">Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b capitalize">{user.role}</td>
                <td className="py-2 px-4 border-b">
                  <button className="bg-red-500 text-white px-2 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default AdminDashboard;
