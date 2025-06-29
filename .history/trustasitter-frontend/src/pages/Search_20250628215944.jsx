import React, { useEffect, useState } from "react";
import axios from "axios";

const Search = () => {
  const [babysitters, setBabysitters] = useState([]);

  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/babysitters");
        setBabysitters(res.data);
      } catch (err) {
        console.error("Error fetching babysitters:", err);
      }
    };

    fetchBabysitters();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Find a Babysitter</h1>
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select className="border p-2 rounded">
          <option value="">Select Region</option>
          <option value="Central">Central</option>
          <option value="West">West</option>
          <option value="East">East</option>
        </select>
        <input type="date" className="border p-2 rounded" />
        <select className="border p-2 rounded">
          <option value="">Availability</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {babysitters.map((babysitter) => (
          <div
            key={babysitter.id}
            className="border rounded p-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold">{babysitter.name}</h2>
              <p className="text-gray-600">Region: {babysitter.region}</p>
              <p className="text-gray-600">Availability: {babysitter.availability}</p>
              <p className="text-gray-600">Price: {babysitter.price}</p>
            </div>
            <button className="mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
