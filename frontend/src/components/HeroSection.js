import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HeroSection.css';

const HeroSection = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
    const handleLogout = () => {
    logout();
    // Stay on the home page after logout
    window.location.reload(); // Refresh the page to update UI states
  };
  
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Take Control of Your Finances</h1>
        <p>A smart budget planner for students. Track your spending, set savings goals, and more.</p>
        {isAuthenticated ? (
          <div className="auth-buttons">
            <Link to="/dashboard" className="cta-button">Go to Dashboard</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        ) : (
          <Link to="/signup" className="cta-button">Get Started</Link>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
