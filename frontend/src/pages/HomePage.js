import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';
import Footer from '../components/Footer';
import './HomePage.css';

const HomePage = () => (
  <div className="home-page">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <HowItWorksSection />
    <Footer />
  </div>
);

export default HomePage;
