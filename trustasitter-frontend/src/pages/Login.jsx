import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUniversal } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ConnectionTest from '../components/ConnectionTest';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log('Attempting login with:', { email, password: '***' });
      const data = await loginUniversal(email, password);

      // Aqui vamos confiar no backend
      const role = data.role; // vai ser "user" ou "babysitter"

      login({
        token: data.token,
        user: data.user, // dados da pessoa
        role: role
      });

      // Redireciona conforme role
      if (role === "user") {
        navigate("/homeclient");
      } else if (role === "babysitter") {
        navigate("/home-babysitter");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 500) {
        setError("Internal server error. Please try again.");
      } else if (err.code === 'ECONNABORTED') {
        setError("Connection timeout. Please check your internet connection.");
      } else if (err.code === 'NETWORK_ERROR') {
        setError("Network error. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-purple-100 via-white to-purple-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">User Login</h2>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600"
          >
            Login
          </button>
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/choose-role"
                className="text-purple-600 hover:underline font-semibold"
              >
                Click here to register
              </Link>
            </p>
          </div>
        </form>
        {/* ConnectionTest removed as requested */}
      </div>
    </div>
  );
};

export default Login;
