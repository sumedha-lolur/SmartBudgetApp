import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUpPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      tempErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      tempErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
      isValid = false;
    }    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      tempErrors.phone = "Phone number is invalid (10 digits required)";
      isValid = false;
    }

    if (!formData.agreeToTerms) {
      tempErrors.agreeToTerms = "You must agree to the terms and conditions";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Prepare data for backend with all fields
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || ''
        };        // Send request to backend API
        const response = await fetch('http://localhost:5000/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
          if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }        
        // Use the login function from AuthContext
        login({
          token: data.token,
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || ''
        });
        
        console.log("Registration successful");
        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Registration error:", error);
        setErrors({ general: error.message || "Registration failed. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="signup-page">
      <Navbar />
      <div className="signup-container">
        <div className="signup-form-container">
          <h1>Create Your Account</h1>
          <p className="signup-subtitle">Start your journey towards financial control</p>
          
          <form className="signup-form" onSubmit={handleSubmit}>
            {errors.general && <div className="error-message general">{errors.general}</div>}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "input-error" : ""}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "input-error" : ""}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                placeholder="Enter your email"
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  placeholder="Create a password"
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
                placeholder="Enter your phone number"
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeToTerms">
                I agree to the <Link to="/terms" className="terms-link">Terms and Conditions</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
              </label>
              {errors.agreeToTerms && <div className="error-message">{errors.agreeToTerms}</div>}
            </div>
            
            <button 
              type="submit" 
              className="signup-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
          
          <div className="signup-footer">
            <p>Already have an account? <Link to="/login">Log In</Link></p>
          </div>
        </div>
        <div className="signup-image-container">
          <div className="signup-overlay">
            <h2>Your financial journey begins here</h2>
            <p>Join thousands of users who have taken control of their finances with our comprehensive budget tracking tools.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUpPage;
