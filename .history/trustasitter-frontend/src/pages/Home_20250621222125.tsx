export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to TrustaSitter</h1>
      <p className="text-gray-700">Find trusted babysitters in your area.</p>
       <button className="bg-indigo-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-indigo-600 transition">
        Find Babysitters
      </button>
    </div>
  );
}
