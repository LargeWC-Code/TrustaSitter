// App.jsx – Router setup with Navbar
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar'; // Importing the Navbar component
import Footer from './components/Footer'; // Importing the Footer component
import Home from './pages/Home';  // Importing the Home component
import Search from './pages/Search';  // Importing the Search component
import Login from './pages/Login';  // Importing the Login component
import Bookings from './pages/Bookings';    // Importing the Bookings component
import ChooseRole from './pages/ChooseRole';  // Importing the ChooseRole component
import RegisterBabysitter from './pages/RegisterBabysitter'; // Importing the RegisterBabysitter component
import RegisterClient from './pages/RegisterClient'; // Importing the RegisterClient component
import  HomeClient from './pages/HomeClient'; // Importing the HomeClient component
import HomeBabysitter from './pages/HomeBabysitter'; // Importing the HomeBabysitter component
import ProfileBabysitter from "./pages/ProfileBabysitter"; // Importing the ProfileBabysitter component
import ScrollToTop from './components/ScrollToTop'; // Importing the ScrollToTop component
import ProfileClient from './pages/ProfileClient';

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/homeclient" element={<HomeClient />} />
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/home-babysitter" element={<HomeBabysitter />} />
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/register-babysitter" element={<RegisterBabysitter />} />
          <Route path="/profile" element={<ProfileBabysitter />} />
          <Route path="/profile-client" element={<ProfileClient />} />       
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
