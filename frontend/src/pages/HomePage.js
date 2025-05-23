import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import Footer from '../components/Footer';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(true);
  
  useEffect(() => {
    // Get redirect preference from localStorage
    const noRedirect = localStorage.getItem('noRedirect') === 'true';
    
    // If user is already authenticated and we should redirect
    if (isAuthenticated && shouldRedirect && !noRedirect) {
      navigate('/dashboard');
    }
    
    // Clean up redirect preference after first check
    return () => {
      localStorage.removeItem('noRedirect');
    };
  }, [isAuthenticated, navigate, shouldRedirect]);
  const disableRedirect = () => {
    setShouldRedirect(false);
  };

  return (
    <div className="home-page">
      <Navbar disableRedirect={disableRedirect} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default HomePage;
