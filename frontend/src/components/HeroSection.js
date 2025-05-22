import React from 'react';
import './HeroSection.css';

const HeroSection = () => (
  <section className="hero">
    <div className="hero-content">
      <h1>Take Control of Your Finances</h1>
      <p>A smart budget planner for students. Track your spending, set savings goals, and more.</p>
      <a href="/signup" className="cta-button">Get Started</a>
    </div>
  </section>
);

export default HeroSection;
