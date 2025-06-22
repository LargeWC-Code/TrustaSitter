import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="p-6">
      {/* Section 1: Hero */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-blue-600">Trusta</span>
          <span className="text-purple-500">Sitter</span>
        </h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          Reliable, verified babysitters just a few clicks away. Whether you're a parent looking for peace of mind or a babysitter ready to help, we've got you covered.
        </p>
      </section>

      {/* Section 2: Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-2">Verified Babysitters</h2>
          <p>All sitters undergo background checks and profile validations.</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-2">Easy Booking</h2>
          <p>Schedule, manage and track bookings effortlessly through the platform.</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-2">Trusted by Families</h2>
          <p>Hundreds of families rely on TrustaSitter for quality child care.</p>
        </div>
      </section>

      {/* Section 3: Image Carousel */}
      <section className="mb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <img
            src="https://images.unsplash.com/photo-1589561084283-930aa7b1e983"
            alt="Babysitter playing"
            className="rounded shadow h-56 object-cover w-full"
          />
          <img
            src="https://images.unsplash.com/photo-1607746882042-944635dfe10e"
            alt="Happy child"
            className="rounded shadow h-56 object-cover w-full"
          />
          <img
            src="https://images.unsplash.com/photo-1607746881894-e7ab6b12b27d"
            alt="Scheduling babysitter"
            className="rounded shadow h-56 object-cover w-full"
          />
        </div>
      </section>

      {/* Section 4: Call to Action */}
      <section className="bg-purple-600 text-white text-center py-12 px-6 rounded-lg mt-10 shadow-md">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="mb-6 text-lg">Join our community of trusted families and babysitters today.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/search"
            className="bg-white text-purple-600 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
          >
            Find a Babysitter
          </Link>
          <Link
            to="/register"
            className="bg-white text-purple-600 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
          >
            Become a Babysitter
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
