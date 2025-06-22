import React from 'react';

const Home = () => {
  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6">
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition">
            Find a Babysitter
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded transition">
            View My Bookings
          </button>
        </div>
      </div>

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

      {/* Section 3 – Highlights with images */}
      <div className="max-w-6xl mx-auto mb-16">
  <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">What Makes Us Special</h2>
  <div className="grid md:grid-cols-3 gap-8">
    <div className="bg-white rounded shadow hover:shadow-lg transition overflow-hidden">
      <img
        src="https://images.pexels.com/photos/3933063/pexels-photo-3933063.jpeg?auto=compress&cs=tinysrgb&w=800"
        alt="Happy babysitter with child"
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Care with a Smile</h3>
        <p className="text-gray-600">Our sitters love what they do and bring joy to every home they visit.</p>
      </div>
    </div>

    <div className="bg-white rounded shadow hover:shadow-lg transition overflow-hidden">
      <img
        src="https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=800"
        alt="Scheduling babysitter"
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
        <p className="text-gray-600">Use our platform to book sitters instantly with full control and visibility.</p>
      </div>
    </div>

    <div className="bg-white rounded shadow hover:shadow-lg transition overflow-hidden">
      <img
        src="https://images.pexels.com/photos/3662665/pexels-photo-3662665.jpeg?auto=compress&cs=tinysrgb&w=800"
        alt="Family relaxing"
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Peace of Mind</h3>
        <p className="text-gray-600">All our sitters go through a verification process so you can feel safe.</p>
      </div>
    </div>
  </div>
      </div>
    </main>
  );
};

export default Home;
