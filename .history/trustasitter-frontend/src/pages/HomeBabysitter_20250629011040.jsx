// src/pages/HomeBabysitter.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const HomeBabysitter = () => {
  // Mock data to simulate upcoming bookings
  const [bookings] = useState([
    {
      id: 1,
      parentName: "Sarah Johnson",
      date: "2024-07-12",
      time: "09:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      parentName: "Michael Brown",
      date: "2024-07-15",
      time: "02:00 PM",
      status: "Pending Approval",
    },
  ]);

  return (
    <main className="bg-gradient-to-br from-purple-50 to-purple-100 min-h-screen py-12 px-6">
      {/* Welcome message */}
      <h1 className="text-3xl font-bold text-center mb-8">
        Welcome back, <span className="text-purple-600">Babysitter!</span>
      </h1>

      {/* Bookings section */}
      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Your Upcoming Bookings
        </h2>

        {bookings.length === 0 ? (
          <p className="text-gray-600">You have no upcoming bookings.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded shadow p-4 flex flex-col justify-between"
              >
                <div>
                  <p className="text-gray-800 font-medium">
                    Parent: {booking.parentName}
                  </p>
                  <p className="text-gray-600">
                    Date: {booking.date}
                  </p>
                  <p className="text-gray-600">
                    Time: {booking.time}
                  </p>
                  <p
                    cl
