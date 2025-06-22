// Component: Navbar
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <span style={{ color: '#007BFF', fontWeight: 'bold' }}>Trust</span>
        <span style={{ color: '#9b59b6' }}>aSitter</span>
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/search" style={styles.link}>Search</Link>
        <Link to="/bookings" style={styles.link}>Bookings</Link>
        <Link to="/login" style={styles.link}>Login</Link>
        <Link to="/register" style={styles.link}>Register</Link>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#f9f9f9',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '24px',
    fontFamily: 'Poppins, sans-serif',
  },
  links: {
    display: 'flex',
    gap: '16px',
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Poppins, sans-serif',
  },
};

export default Navbar;
