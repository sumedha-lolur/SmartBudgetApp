import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => (
  <section id="features" className="features">
    <h2>Features</h2>
    <div className="features-container">
      <div className="feature">
        <h3>Track Expenses</h3>
        <p>Keep an eye on your spending with detailed expense tracking.</p>
      </div>
      <div className="feature">
        <h3>Set Budgets</h3>
        <p>Create custom budgets to manage your finances effectively.</p>
      </div>
      <div className="feature">
        <h3>Save for Goals</h3>
        <p>Plan and save for future goals with our goal-setting feature.</p>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
