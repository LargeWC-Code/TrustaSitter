import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm text-gray-600">
        {/* Logo and description */}
        <div>
          <h2 className="text-xl font-bold mb-3">
            <span className="text-blue-600">Trusta</span>
            <span className="text-purple-500">Sitter</span>
          </h2>
          <p className="text-gray-500">Your trusted babysitter platform in Auckland.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3 text-purple-600 uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                onClick={() => window.scrollTo(0, 0)}
                className="hover:underline hover:text-purple-600 transition"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/search"
                onClick={() => window.scrollTo(0, 0)}
                className="hover:underline hover:text-purple-600 transition"
              >
                Find a Babysitter
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                onClick={() => window.scrollTo(0, 0)}
                className="hover:underline hover:text-purple-600 transition"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register-babysitter"
                onClick={() => window.scrollTo(0, 0)}
                className="hover:underline hover:text-purple-600 transition"
              >
                Register as Babysitter
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact and socials */}
        <div>
          <h3 className="font-semibold mb-3 text-purple-600 uppercase tracking-wider">Contact</h3>
          <p className="text-gray-500">Email: support@trustasitter.co.nz</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-purple-500 hover:text-purple-700 transition">
              <FaFacebook size={18} />
            </a>
            <a href="#" className="text-purple-500 hover:text-purple-700 transition">
              <FaInstagram size={18} />
            </a>
            <a href="#" className="text-purple-500 hover:text-purple-700 transition">
              <FaTwitter size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 py-4 border-t">
        © {new Date().getFullYear()} TrustaSitter. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
