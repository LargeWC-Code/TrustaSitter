import React, { useEffect, useState } from "react";
import axios from "axios";

const Search = () => {
  const [babysitters, setBabysitters] = useState([]);

  useEffect(() => {
    // Aqui ainda vai o fetch real quando conectarmos o backend
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

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
      {/* Título */}
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
