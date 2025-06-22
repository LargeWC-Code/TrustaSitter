import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center px-4 text-center mt-[-80px]">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        <span className="text-blue-600">Trusta</span>
        <span className="text-purple-500">Sitter</span>
      </h1>
      <p className="text-gray-700 text-lg mb-8 max-w-xl">
        Easily find trusted, verified, and nearby babysitters in your area. 
        Your peace of mind starts here.
      </p>
      <Link
        to="/search"
        className="bg-purple-500 hover:bg-purple-600 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
      >
        Find a Babysitter
      </Link>
    </div>
  );
}

export default Home;
