import React from 'react';

export default function RegisterBabysitter() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Babysitter Registration
        </h2>

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input type="text" className="w-full border px-4 py-2 rounded-md" placeholder="Maria Johnson" />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Regions you serve</label>
            <input type="text" className="w-full border px-4 py-2 rounded-md" placeholder="South Auckland, East Auckland..." />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Availability</label>
            <input type="text" className="w-full border px-4 py-2 rounded-md" placeholder="Weekdays after 3pm, weekends..." />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Background Check (Upload)</label>
            <input type="file" className="w-full border px-4 py-2 rounded-md" />
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
}
