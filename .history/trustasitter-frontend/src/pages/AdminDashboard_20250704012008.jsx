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

      {/* Next sections will come in the next steps */}
      <p className="text-gray-600 text-center">Bookings and Users will be listed below in the next steps.</p>
    </main>
  );
};

export default AdminDashboard;
