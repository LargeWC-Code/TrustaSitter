// App.jsx – Router setup with Navbar
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import Bookings from './pages/Bookings';
import ChooseRole from './pages/ChooseRole';
import RegisterBabysitter from './pages/RegisterBabysitter';
import RegisterClient from './pages/RegisterClient';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="p-6">
        <Routes>
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/register-babysitter" element={<RegisterBabysitter />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
