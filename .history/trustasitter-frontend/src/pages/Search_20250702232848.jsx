// src/pages/Search.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Search = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        <span className="text-blue-600">Find</span>{" "}
        <span className="text-purple-500">a Babysitter</span>
      </h1>

      {/* Filters */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <select className="px-4 py-2 border rounded focus:outline-none">
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
        />
        <select className="px-4 py-2 border rounded focus:outline-none">
          <option value="">Availability</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
        <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition">
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading babysitters...</p>
      ) : babysitters.length === 0 ? (
        <p className="text-center text-gray-600">No babysitters found.</p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {babysitters.map((sitter) => (
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
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                onClick={() => alert("Booking flow will be implemented here")}
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
