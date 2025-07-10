// src/pages/Search.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const Search = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Modal state
  const [modal, setModal] = useState({ message: "", type: "" });

  // Fetch babysitters when component mounts
  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        const response = await api.get("/babysitters");
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
    const regionMatch = selectedRegion
      ? sitter.region && sitter.region.toLowerCase() === selectedRegion.toLowerCase()
      : true;

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

    const dateMatch = selectedDate
      ? sitter.available_days &&
        sitter.available_days.includes(
          new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" })
        )
      : true;

    return regionMatch && availabilityMatch && dateMatch;
  });

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6 relative">
      {/* Modal Overlay */}
      {modal.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-center">
            {modal.type === "login-required" ? (
              <>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Login Required
                </h2>
                <p className="text-gray-600 mb-4">{modal.message}</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setModal({ message: "", type: "" })}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => window.location.href = "/login"}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => window.location.href = "/choose-role"}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                  >
                    Register
                  </button>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-center mb-8">
        <span className="text-blue-600">Find</span>{" "}
        <span className="text-purple-500">a Babysitter</span>
      </h1>

      {/* Filters */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
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

        <input
          type="date"
          className="px-4 py-2 border rounded focus:outline-none"
          value={selectedDate}
          onChange={handleDateChange}
        />

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

      {loading ? (
        <p className="text-center text-gray-600">Loading babysitters...</p>
      ) : filteredBabysitters.length === 0 ? (
        <p className="text-center text-gray-600">
          No babysitters match your criteria.
        </p>
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
              <button
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem("user"));
                  if (!user) {
                    setModal({
                      message: "To book a babysitter, please log in or create an account.",
                      type: "login-required",
                    });
                    return;
                  }

                  // If logged in, proceed to create booking
                  (async () => {
                    try {
                      const userId = user.id;

                      const bookingData = {
                        user_id: userId,
                        babysitter_id: sitter.id,
                        date: new Date().toISOString().split("T")[0],
                        time_start: "09:00",
                        time_end: "12:00",
                        status: "pending",
                      };

                      await api.post(
                        "/bookings",
                        bookingData
                      );

                      setModal({
                        message: "Booking created successfully!",
                        type: "success",
                      });
                    } catch (error) {
                      console.error("Error creating booking:", error);
                      setModal({
                        message: "Failed to create booking.",
                        type: "error",
                      });
                    }
                  })();
                }}
              >
                Request Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Search;
