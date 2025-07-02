// src/pages/Search.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Search = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // Success/Error toast

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch babysitters when component mounts
  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/babysitters");
        setBabysitters(response.data);
      } catch (error) {
        console.error("Error fetching babysitters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBabysitters();
  }, []);

  // Handle region change
  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };

  // Handle availability change
  const handleAvailabilityChange = (e) => {
    setSelectedAvailability(e.target.value);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Filtered babysitters based on selected filters
  const filteredBabysitters = babysitters.filter((sitter) => {
    // Region filter
    const regionMatch = selectedRegion
      ? sitter.region && sitter.region.toLowerCase() === selectedRegion.toLowerCase()
      : true;

    // Availability filter
    let availabilityMatch = true;
    if (selectedAvailability && sitter.available_from && sitter.available_to) {
      const startHour = parseInt(sitter.available_from.split(":")[0]);

      if (selectedAvailability === "morning") {
        availabilityMatch = startHour <= 12;
      } else if (selectedAvailability === "afternoon") {
        availabilityMatch = startHour >= 12 && startHour < 18;
      } else if (selectedAvailability === "evening") {
        availabilityMatch = startHour >= 18;
      }
    }

    // Date filter
    const dateMatch = selectedDate
      ? sitter.available_days &&
        sitter.available_days.includes(new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }))
      : true;

    return regionMatch && availabilityMatch && dateMatch;
  });

  // Handle booking creation
  const handleBooking = async (sitterId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user.id;

      const bookingData = {
        user_id: userId,
        babysitter_id: sitterId,
        date: new Date().toISOString().split("T")[0],
        time_start: "09:00",
        time_end: "12:00",
        status: "pending"
      };

      await axios.post("http://localhost:3000/api/bookings", bookingData);

      setToast({ type: "success", message: "Booking created successfully!" });

      // Hide toast after 3s
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Error creating booking:", error);
      setToast({ type: "error", message: "Failed to create booking." });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Handle booking cancellation (placeholder)
  const handleCancelBooking = () => {
    setToast({ type: "error", message: "Cancel booking feature coming soon!" });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6 relative">
      <h1 className="text-4xl font-bold text-center mb-8">
        <span className="text-blue-600">Find</span>{" "}
        <span className="text-purple-500">a Babysitter</span>
      </h1>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white z-50
            ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          {toast.message}
        </div>
      )}

      {/* Filters */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {/* Region filter */}
        <select
          className="px-4 py-2 border rounded focus:outline-none"
          value={selectedRegion}
          onChange={handleRegionChange}
        >
          <option value="">Select Region</option>
          <option value="Central">Central</option>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="North">North</option>
          <option value="South">South</option>
        </select>

        {/* Date filter */}
        <input
          type="date"
          className="px-4 py-2 border rounded focus:outline-none"
          value={selectedDate}
          onChange={handleDateChange}
        />

        {/* Availability filter */}
        <select
          className="px-4 py-2 border rounded focus:outline-none"
          value={selectedAvailability}
          onChange={handleAvailabilityChange}
        >
          <option value="">Availability</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>

        {/* Clear Filters */}
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
          onClick={() => {
            setSelectedRegion("");
            setSelectedAvailability("");
            setSelectedDate("");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Babysitter list */}
      {loading ? (
        <p className="text-center text-gray-600">Loading babysitters...</p>
      ) : filteredBabysitters.length === 0 ? (
        <p className="text-center text-gray-600">No babysitters match your criteria.</p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBabysitters.map((sitter) => (
            <div
              key={sitter.id}
              className="bg-white rounded shadow p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {sitter.name}
                </h2>
                <p className="text-gray-600 mb-1">
                  <strong>Region:</strong> {sitter.region || "Not specified"}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Rate:</strong>{" "}
                  {sitter.rate ? `$${sitter.rate}/hr` : "Not specified"}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Available:</strong>{" "}
                  {sitter.available_days
                    ? sitter.available_days.join(", ")
                    : "Not specified"}
                </p>
                <p className="text-gray-600">
                  <strong>About:</strong>{" "}
                  {sitter.about || "No description provided."}
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
                  onClick={() => handleBooking(sitter.id)}
                >
                  Request Booking
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                  onClick={handleCancelBooking}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Search;
