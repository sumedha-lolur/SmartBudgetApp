import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardNav from "../components/DashboardNav";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import "./BudgetFormPage.css";

const BudgetFormPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    budgetName: "",
    budgetAmount: "",
    category: "Housing",
    startDate: "",
    endDate: "",
    budgetType: "monthly",
    description: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [currentUser, navigate, location]);

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

    if (!formData.budgetName.trim()) {
      tempErrors.budgetName = "Budget name is required";
      isValid = false;
    }

    if (!formData.budgetAmount) {
      tempErrors.budgetAmount = "Budget amount is required";
      isValid = false;
    } else if (parseFloat(formData.budgetAmount) <= 0) {
      tempErrors.budgetAmount = "Budget amount must be greater than 0";
      isValid = false;
    }
    
    if (!formData.category) {
      tempErrors.category = "Category is required";
      isValid = false;
    }

    if (!formData.startDate) {
      tempErrors.startDate = "Start date is required";
      isValid = false;
    }

    if (!formData.endDate) {
      tempErrors.endDate = "End date is required";
      isValid = false;
    }
    
    // Check if end date is after start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        tempErrors.endDate = "End date must be after start date";
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Prepare data for backend
        const budgetData = {
          name: formData.budgetName,
          amount: parseFloat(formData.budgetAmount),
          category: formData.category,
          startDate: formData.startDate,
          endDate: formData.endDate,
          description: formData.description || '',
        };
        
        // Send request to backend API
        const response = await fetch('http://localhost:5000/api/budgets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify(budgetData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create budget');
        }
        
        console.log("Budget created successfully:", data);
        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Error creating budget:", error);
        setErrors({ general: error.message || "Failed to create budget. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="budget-page">
      <DashboardNav />
      <div className="budget-container">
        <div className="budget-form-container">
          <h1>Create a New Budget</h1>
          <p className="budget-subtitle">Set up your budget to start tracking your finances effectively</p>
          
          <form className="budget-form" onSubmit={handleSubmit}>
            {errors.general && <div className="error-message general">{errors.general}</div>}
            
            <div className="form-group">
              <label htmlFor="budgetName">Budget Name</label>
              <input
                type="text"
                id="budgetName"
                name="budgetName"
                value={formData.budgetName}
                onChange={handleChange}
                className={errors.budgetName ? "input-error" : ""}
                placeholder="e.g., Monthly Household Budget"
              />
              {errors.budgetName && <div className="error-message">{errors.budgetName}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="budgetAmount">Budget Amount</label>
              <div className="input-with-icon">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="budgetAmount"
                  name="budgetAmount"
                  value={formData.budgetAmount}
                  onChange={handleChange}
                  className={errors.budgetAmount ? "input-error with-icon" : "with-icon"}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              {errors.budgetAmount && <div className="error-message">{errors.budgetAmount}</div>}
            </div>
              <div className="form-group">
              <label htmlFor="category">Budget Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? "input-error" : ""}
              >
                <option value="Housing">Housing</option>
                <option value="Transportation">Transportation</option>
                <option value="Food">Food</option>
                <option value="Utilities">Utilities</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Insurance">Insurance</option>
                <option value="Debt">Debt</option>
                <option value="Personal">Personal</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Education">Education</option>
                <option value="Savings">Savings</option>
                <option value="Gifts/Donations">Gifts/Donations</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <div className="error-message">{errors.category}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="budgetType">Budget Type</label>
              <select
                id="budgetType"
                name="budgetType"
                value={formData.budgetType}
                onChange={handleChange}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="annual">Annual</option>
                <option value="custom">Custom</option>
              </select>
            </div>
              <div className="date-group">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? "input-error" : ""}
                />
                {errors.startDate && <div className="error-message">{errors.startDate}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? "input-error" : ""}
                />
                {errors.endDate && <div className="error-message">{errors.endDate}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Add additional details about this budget"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="budget-button"
              disabled={loading}
            >
              {loading ? "Creating Budget..." : "Create Budget"}
            </button>
          </form>
          
          <div className="budget-footer">
            <p>Need help? <a href="/contact">Contact Support</a></p>
          </div>
        </div>
        <div className="budget-image-container">
          <div className="budget-overlay">
            <h2>Plan your finances wisely</h2>
            <p>Creating a budget is the first step toward financial freedom and achieving your financial goals.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BudgetFormPage;
