// App.jsx – Router setup with Navbar
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import Login from './pages/Login';
import Bookings from './pages/Bookings';
import ChooseRole from './pages/ChooseRole';
import RegisterBabysitter from './pages/RegisterBabysitter';
import RegisterClient from './pages/RegisterClient';
import HomeClient from './pages/HomeClient';
import HomeBabysitter from './pages/HomeBabysitter';
import ProfileBabysitter from "./pages/ProfileBabysitter";
import ProfileClient from './pages/ProfileClient';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute'; // NEW: Import ProtectedRoute

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <div className="p-6">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/register-babysitter" element={<RegisterBabysitter />} />
          <Route path="/register-client" element={<RegisterClient />} />

          {/* Protected Routes for Clients */}
          <Route
            path="/homeclient"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <HomeClient />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-client"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ProfileClient />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes for Babysitters */}
          <Route
            path="/home-babysitter"
            element={
              <ProtectedRoute allowedRoles={["babysitter"]}>
                <HomeBabysitter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["babysitter"]}>
                <ProfileBabysitter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
