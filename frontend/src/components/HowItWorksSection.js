import React from 'react';
import './HowItWorksSection.css';

const HowItWorksSection = () => (
  <section id="how-it-works" className="how-it-works">
    <h2>How It Works</h2>
    <div className="steps">
      <div className="step">
        <h3>1. Sign Up</h3>
        <p>Create an account to start managing your budget and expenses.</p>
      </div>
      <div className="step">
        <h3>2. Add Transactions</h3>
        <p>Log your income and expenses to keep track of your finances.</p>
      </div>
      <div className="step">
        <h3>3. Monitor Progress</h3>
        <p>Use our tools to stay on top of your financial goals.</p>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
