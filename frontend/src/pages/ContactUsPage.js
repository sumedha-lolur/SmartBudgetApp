import React, { useState } from "react";
import DashboardNav from "../components/DashboardNav";
import Footer from "../components/Footer";
import "./ContactUsPage.css";

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email address is invalid";
      isValid = false;
    }

    if (!formData.subject.trim()) {
      tempErrors.subject = "Subject is required";
      isValid = false;
    }

    if (!formData.message.trim()) {
      tempErrors.message = "Message is required";
      isValid = false;
    } else if (formData.message.length < 10) {
      tempErrors.message = "Message should be at least 10 characters";
      isValid = false;
    }

    setFormErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      // Simulate form submission with a delay
      setTimeout(() => {
        console.log("Form submitted:", formData);
        setSubmitSuccess(true);
        setLoading(false);
        setFormData({ 
          name: "", 
          email: "", 
          subject: "",
          message: "" 
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      }, 1500);
    }
  };

  return (
    <div className="contact-us-page">
      <DashboardNav />
      
      <div className="contact-container">
        <div className="contact-info-container">
          <div className="contact-info">
            <h1>Get In Touch</h1>
            <p className="contact-subtitle">
              Have questions about our services or need help with your account? 
              We're here to help you manage your finances better.
            </p>
            
            <div className="contact-details">
              <div className="contact-detail">
                <div className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="contact-text">
                  <h3>Our Location</h3>
                  <p>123 Finance Street, Budget Plaza<br />New York, NY 10001</p>
                </div>
              </div>
              
              <div className="contact-detail">
                <div className="contact-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div className="contact-text">
                  <h3>Phone Number</h3>
                  <p>+1 (555) 123-4567</p>
                  <p>Monday - Friday, 9am - 5pm EST</p>
                </div>
              </div>
              
              <div className="contact-detail">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-text">
                  <h3>Email Address</h3>
                  <p>support@budgetapp.com</p>
                  <p>We'll respond within 24 hours</p>
                </div>
              </div>
            </div>
            
            <div className="social-links">
              <h3>Follow Us</h3>
              <div className="social-icons">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="contact-form-container">
          <div className="form-wrapper">
            <h2>Send Us a Message</h2>
            
            {submitSuccess ? (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <p>Your message has been sent successfully! We'll get back to you soon.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={formErrors.name ? "input-error" : ""}
                  />
                  {formErrors.name && <p className="error-message">{formErrors.name}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={formErrors.email ? "input-error" : ""}
                  />
                  {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className={formErrors.subject ? "input-error" : ""}
                  />
                  {formErrors.subject && <p className="error-message">{formErrors.subject}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you"
                    rows="5"
                    className={formErrors.message ? "input-error" : ""}
                  />
                  {formErrors.message && <p className="error-message">{formErrors.message}</p>}
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <div className="map-container">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304603!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1649955309469!5m2!1sen!2s" 
          title="Our Location"
          width="100%" 
          height="400" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
        ></iframe>
      </div>
      
      <div className="faq-section">
        <div className="faq-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I reset my password?</h3>
              <p>You can reset your password by clicking on the "Forgot Password" link on the login page and following the instructions sent to your email.</p>
            </div>
            <div className="faq-item">
              <h3>Is my financial data secure?</h3>
              <p>Yes, we use industry-standard encryption and security measures to ensure your financial data remains private and protected.</p>
            </div>
            <div className="faq-item">
              <h3>Can I create multiple budgets?</h3>
              <p>Absolutely! You can create and manage multiple budgets for different purposes like personal expenses, family budgeting, or specific projects.</p>
            </div>
            <div className="faq-item">
              <h3>How do I connect my bank account?</h3>
              <p>Navigate to the "Add Account" section in your dashboard, select your bank, and follow the secure connection process.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactUsPage;
