import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserFriends, FaBaby } from "react-icons/fa";

export default function ChooseRole() {
  const navigate = useNavigate();

  const handleChoice = (role) => {
    if (role === 'babysitter') {
      navigate('/register-babysitter');
    } else if (role === 'client') {
      navigate('/register-client');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          What type of account would you like to create?
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => handleChoice('client')}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md font-semibold"
          >
            <FaUserFriends className="text-xl" />
            I'm a Parent
          </button>

          <button
            onClick={() => handleChoice('babysitter')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold"
          >
            <FaBaby className="text-xl" />
            I'm a Babysitter
          </button>
        </div>
      </div>
    </div>
  );
}
