import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm text-gray-600">
        {/* Logo and description */}
        <div>
          <h2 className="text-xl font-bold mb-2">
            <span className="text-blue-600">Trusta</span>
            <span className="text-purple-500">Sitter</span>
          </h2>
          <p>Your trusted babysitter platform in Auckland.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/search">Find a Babysitter</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/bookings">Bookings</Link></li>
          </ul>
        </div>

        {/* Contact and socials */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p>Email: support@trustasitter.co.nz</p>
          <div className="flex space-x-4 mt-3">
            <a href="#" className="text-purple-500 hover:text-purple-700"><FaFacebook /></a>
            <a href="#" className="text-purple-500 hover:text-purple-700"><FaInstagram /></a>
            <a href="#" className="text-purple-500 hover:text-purple-700"><FaTwitter /></a>
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
