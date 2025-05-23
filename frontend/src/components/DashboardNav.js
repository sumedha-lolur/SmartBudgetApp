import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './DashboardNav.css';

const DashboardNav = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if screen size is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Close any open dropdown when closing the menu
    if (menuOpen) {
      setActiveDropdown(null);
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (index, e) => {
    if (isMobile) {
      e.preventDefault();
      setActiveDropdown(activeDropdown === index ? null : index);
    }
  };

  // Close menu when a link is clicked
  const closeMenu = () => {
    if (isMobile) {
      setMenuOpen(false);
      setActiveDropdown(null);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">SmartBudget</Link>
        
        <div className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <ul className={`nav-links ${menuOpen ? 'show-menu' : ''}`}>
          <li className="nav-item">
            <Link 
              to={isMobile ? "#" : "/dashboard"} 
              onClick={(e) => isMobile ? toggleDropdown(0, e) : null}
            >
              Dashboard
              {isMobile && <span className="dropdown-arrow"></span>}
            </Link>
            <ul className={`dropdown ${activeDropdown === 0 ? 'show-dropdown' : ''}`}>
              <li><Link to="/dashboard#dashboard-summary" onClick={closeMenu}>Summary</Link></li>
              <li><Link to="/dashboard#transactions-list" onClick={closeMenu}>Recent Activity</Link></li>
              <li><Link to="/dashboard#goals-section" onClick={closeMenu}>Goals</Link></li>
            </ul>
          </li>
          <li className="nav-item">
            <Link 
              to={isMobile ? "#" : "/create-budget"} 
              onClick={(e) => isMobile ? toggleDropdown(1, e) : null}
            >
              Budget
              {isMobile && <span className="dropdown-arrow"></span>}
            </Link>
            <ul className={`dropdown ${activeDropdown === 1 ? 'show-dropdown' : ''}`}>
              <li><Link to="/create-budget" onClick={closeMenu}>Create Budget</Link></li>
              {/* <li><Link to="/create-budget" onClick={closeMenu}>Manage Budget</Link></li> */}
              <li><Link to="/contact" onClick={closeMenu}>Contact Us</Link></li>
            </ul>
          </li>          <li className="nav-item">
            <Link 
              to="#" 
              onClick={(e) => isMobile ? toggleDropdown(2, e) : null}
            >
              Accounts
              {isMobile && <span className="dropdown-arrow"></span>}
            </Link>
            <ul className={`dropdown ${activeDropdown === 2 ? 'show-dropdown' : ''}`}>
              <li><Link to="/add-account" onClick={closeMenu}>Add Account</Link></li>
              {/* <li><Link to="/add-account" onClick={closeMenu}>View Accounts</Link></li> */}
              <li><Link to="/transactions" onClick={closeMenu}>Transactions</Link></li>
            </ul>
          </li>
          <li className="nav-item logout-item">
            <button 
              onClick={handleLogout} 
              className="logout-button"
              title={`Logout ${currentUser?.firstName || 'User'}`}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default DashboardNav;