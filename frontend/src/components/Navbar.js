import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = ({ disableRedirect }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // If disableRedirect is available, call it on component mount
  useEffect(() => {
    if (currentUser && disableRedirect) {
      disableRedirect();
    }
  }, [currentUser, disableRedirect]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when clicking a link (for mobile)
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="logo">SmartBudget</Link>
        
        {/* Hamburger menu button */}
        <div 
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
          {/* Navigation menu */}
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link to="/#features" onClick={handleLinkClick}>Features</Link>
            <Link to="/#how-it-works" onClick={handleLinkClick}>How It Works</Link>
            {currentUser && (
              <>
                <Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link>
                <Link to="/transactions" onClick={handleLinkClick}>Transactions</Link>
              </>
            )}
          </div>
          <div className="nav-actions">
            {currentUser ? (
              <>
                <span className="welcome-text">Welcome, {currentUser.firstName}</span>
                <button 
                  className="logout-button" 
                  onClick={() => {
                    logout();
                    navigate('/');
                    handleLinkClick();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={handleLinkClick}>Login</Link>
                <Link to="/signup" className="signup-button" onClick={handleLinkClick}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
