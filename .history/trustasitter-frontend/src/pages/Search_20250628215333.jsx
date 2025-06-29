import React from "react";

const Search = () => {
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

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Aqui vamos mapear babysitters mockados */}
      </div>
    </div>
  );
};

export default Search;
