// src/pages/Home.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const Home = () => {
  const { role } = useContext(AuthContext);
  const [showBabysitterPopup, setShowBabysitterPopup] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();

  const handleBookingsClick = () => {
  if (!role) {
    setShowLoginPopup(true);
  } else if (role === "babysitter") {
    setShowBabysitterPopup(true);
  } else {
    navigate("/bookings");
  }
};

  
  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6 relative">
      {/* Section 1 – Main title and intro */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-blue-600">Trusta</span>
          <span className="text-purple-500">Sitter</span>
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Your trusted babysitter finder in Auckland. Safe, fast, and reliable.
        </p>
        <div className="flex justify-center gap-6">
          <Link
            to="/search"
            onClick={() => window.scrollTo(0, 0)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
          >
            Find a Babysitter
          </Link>
          <button
            onClick={handleBookingsClick}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded transition"
          >
            View My Bookings
          </button>
        </div>
      </div>

      {/* ... (as outras seções ficam exatamente iguais) */}

      {/* Section 2 – Why choose us */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Trusted Babysitters</h3>
            <p className="text-gray-600">All sitters are verified and background-checked to ensure your child's safety.</p>
          </div>
          <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-purple-500 mb-2">Easy Booking</h3>
            <p className="text-gray-600">Schedule and manage bookings with just a few clicks — fast and hassle-free.</p>
          </div>
          <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Local Support</h3>
            <p className="text-gray-600">We are based in Auckland and understand the needs of local families.</p>
          </div>
        </div>
      </div>

      {/* Section 3 – Highlights */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">What Makes Us Special</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cards */}
          {[
            {
              img: "https://images.pexels.com/photos/3933063/pexels-photo-3933063.jpeg?auto=compress&cs=tinysrgb&w=800",
              title: "Care with a Smile",
              desc: "Our sitters love what they do and bring joy to every home they visit."
            },
            {
              img: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=800",
              title: "Smart Scheduling",
              desc: "Use our platform to book sitters instantly with full control and visibility."
            },
            {
              img: "https://images.pexels.com/photos/3662665/pexels-photo-3662665.jpeg?auto=compress&cs=tinysrgb&w=800",
              title: "Peace of Mind",
              desc: "All our sitters go through a verification process so you can feel safe."
            }
          ].map((card, index) => (
            <div key={index} className="bg-white rounded shadow hover:shadow-lg transition overflow-hidden">
              <img src={card.img} alt={card.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-gray-600">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 – CTA */}
      <section className="bg-purple-600 text-white text-center py-12 px-6 rounded-lg mt-10 shadow-md">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="mb-6 text-lg">Join our community of trusted families and babysitters today.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/search"
            onClick={() => window.scrollTo(0, 0)}
            className="bg-white text-purple-600 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
          >
            Find a Babysitter
          </Link>
          <Link
            to="/register-babysitter"
            onClick={() => window.scrollTo(0, 0)}
            className="bg-white text-purple-600 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
          >
            Register as Babysitter
          </Link>
        </div>
      </section>

      {/* Login Popup */}
      {showLoginPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowLoginPopup(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Login Required</h3>
            <p className="mb-6 text-gray-600">
              To view your bookings, please log in or create an account.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/choose-role')}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
