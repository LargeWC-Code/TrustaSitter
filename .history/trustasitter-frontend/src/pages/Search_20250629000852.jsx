import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data de exemplo
    setBabysitters([
      {
        id: 1,
        name: "Anna Smith",
        region: "Central",
        availability: "Morning",
        price: "$20/hour",
      },
      {
        id: 2,
        name: "James Brown",
        region: "West",
        availability: "Evening",
        price: "$18/hour",
      },
      {
        id: 3,
        name: "Lisa Johnson",
        region: "East",
        availability: "Afternoon",
        price: "$22/hour",
      },
    ]);
  }, []);

  const handleBooking = () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Simula agendamento
      alert("Booking confirmed! 🎉 Check your bookings in your dashboard.");
    } else {
      // Usuário não logado -> abre modal
      setShowModal(true);
    }
  };

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      <h1 className="text-4xl font-bold text-center mb-10">
        <span className="text-blue-600">Find</span>{" "}
        <span className="text-purple-500">a Babysitter</span>
      </h1>

      {/* Filtros */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select className="border border-gray-300 p-3 rounded w-full">
          <option value="">Select Region</option>
          <option value="Central">Central</option>
          <option value="West">West</option>
          <option value="East">East</option>
        </select>
        <input
          type="date"
          className="border border-gray-300 p-3 rounded w-full"
        />
        <select className="border border-gray-300 p-3 rounded w-full">
          <option value="">Availability</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
        <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded p-3 w-full transition">
          Search
        </button>
      </div>

      {/* Resultados */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {babysitters.map((babysitter) => (
          <div
            key={babysitter.id}
            className="bg-white rounded shadow p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                {babysitter.name}
              </h2>
              <p className="text-gray-600 mb-1">
                <strong>Region:</strong> {babysitter.region}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Availability:</strong> {babysitter.availability}
              </p>
              <p className="text-gray-600">
                <strong>Price:</strong> {babysitter.price}
              </p>
            </div>
            <button
              onClick={handleBooking}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-center max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              To book a babysitter,
            </h3>
            <p className="text-gray-600 mb-6">
              please login or create an account.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/choose-role")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Register
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Search;
