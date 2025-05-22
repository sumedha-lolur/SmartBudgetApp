import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
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

    if (!formData.email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Send request to backend API
        const response = await fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
          if (!response.ok) {
          throw new Error(data.message || 'Login failed');
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

        console.log("Login successful");
        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Login error:", error);
        setErrors({ general: error.message || "Login failed. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <div className="login-form-container">
          <h1>Login to Your Account</h1>
          <p className="login-subtitle">Welcome back! Please login to access your budget dashboard.</p>
          
          <form className="login-form" onSubmit={handleSubmit}>
            {errors.general && <div className="error-message general">{errors.general}</div>}
            
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
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder="Enter your password"
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="form-actions">
              <div className="remember-me">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </div>
        <div className="login-image-container">
          <div className="login-overlay">
            <h2>Take control of your financial future</h2>
            <p>Track expenses, manage budgets, and achieve your financial goals with our powerful budget app.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;