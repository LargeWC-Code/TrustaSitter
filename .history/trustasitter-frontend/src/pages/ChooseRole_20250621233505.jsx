import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex justify-center items-center min-h-screen bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">What type of account would you like to create?</h2>

        <div className="space-y-4">
          <button
            onClick={() => handleChoice('client')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md font-semibold"
          >
            👨‍👩‍👧 I'm a Parent
          </button>

          <button
            onClick={() => handleChoice('babysitter')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold"
          >
            👩‍🍼 I'm a Babysitter
          </button>
        </div>
      </div>
    </div>
  );
}
