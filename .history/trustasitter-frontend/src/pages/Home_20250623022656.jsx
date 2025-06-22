// Home.jsx – Updated homepage with visual sections and improved layout
import React from 'react';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 text-gray-800">
      {/* Hero section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-blue-600">Trusta</span>
          <span className="text-purple-500">Sitter</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto">
          The easiest way to find trusted babysitters near you. Safe, verified, and reliable childcare at your fingertips.
        </p>
      </div>

      {/* Visual steps */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 px-6 pb-16">
        {/* Step 1 */}
        <div className="max-w-sm text-center">
          <img
            src="https://img.freepik.com/free-vector/parents-reading-book-kids_74855-7485.jpg"
            alt="Create profile"
            className="w-full h-48 object-cover rounded shadow"
          />
          <h3 className="text-xl font-semibold mt-4">Create Your Profile</h3>
          <p className="text-sm mt-2 text-gray-600">Sign up as a parent or babysitter to get started.</p>
        </div>

        {/* Step 2 */}
        <div className="max-w-sm text-center">
          <img
            src="https://img.freepik.com/free-vector/time-management-concept-landing-page_52683-24958.jpg"
            alt="Scheduling babysitter"
            className="w-full h-48 object-cover rounded shadow"
          />
          <h3 className="text-xl font-semibold mt-4">Schedule a Babysitter</h3>
          <p className="text-sm mt-2 text-gray-600">Browse available babysitters by region and availability.</p>
        </div>

        {/* Step 3 */}
        <div className="max-w-sm text-center">
          <img
            src="https://img.freepik.com/free-vector/children-playing-home_1308-99809.jpg"
            alt="Happy kids"
            className="w-full h-48 object-cover rounded shadow"
          />
          <h3 className="text-xl font-semibold mt-4">Peace of Mind</h3>
          <p className="text-sm mt-2 text-gray-600">Rest assured knowing your child is in safe hands.</p>
        </div>

        {/* Step 4 */}
        <div className="max-w-sm text-center">
          <img
            src="https://img.freepik.com/free-vector/customer-satisfaction-survey-illustration_74855-5514.jpg"
            alt="Reviews"
            className="w-full h-48 object-cover rounded shadow"
          />
          <h3 className="text-xl font-semibold mt-4">Leave a Review</h3>
          <p className="text-sm mt-2 text-gray-600">Help others by sharing your experience with the sitter.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
