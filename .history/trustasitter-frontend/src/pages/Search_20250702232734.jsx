// src/pages/SearchBabysitters.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const SearchBabysitters = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/babysitters");
        setBabysitters(response.data);
      } catch (err) {
        console.error("Error fetching babysitters:", err);
        setError("Failed to load babysitters.");
      } finally {
        setLoading(false);
      }
    };

    fetchBabysitters();
  }, []);

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Available Babysitters
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading babysitters...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : babysitters.length === 0 ? (
        <p className="text-center text-gray-600">
          No babysitters found. Check back later!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {babysitters.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold text-purple-700 mb-1">{b.name}</h2>
                <p className="text-gray-600 mb-1">
                  <strong>Region:</strong> {b.region || "Not specified"}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Hourly Rate:</strong>{" "}
                  {b.rate ? `$${b.rate}` : "Not specified"}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Available Days:</strong>{" "}
                  {b.available_days ? b.available_days.join(", ") : "Not specified"}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Hours:</strong>{" "}
                  {b.available_from && b.available_to
                    ? `${b.available_from.slice(0, 5)} - ${b.available_to.slice(0, 5)}`
                    : "Not specified"}
                </p>
                <p className="text-gray-600 mt-2">
                  {b.about || "No description provided."}
                </p>
              </div>
              <button
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default SearchBabysitters;
