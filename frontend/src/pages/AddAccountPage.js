import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardNav from "../components/DashboardNav";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import "./AddAccountPage.css";

const AddAccountPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get account ID from URL if in edit mode
  const isEditMode = !!id;
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    accountName: "",
    accountType: "",
    initialBalance: "",
    currency: "USD",
    isDefault: false,
    notes: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Fetch account data if in edit mode
  useEffect(() => {
    if (isEditMode && currentUser) {
      const fetchAccountData = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/accounts/${id}`, {
            headers: {
              'Authorization': `Bearer ${currentUser.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error('Failed to fetch account data');
          }
          
          const account = await response.json();
          
          setFormData({
            accountName: account.name,
            accountType: account.type,
            initialBalance: account.balance.toString(),
            currency: account.currency,
            isDefault: false, // API doesn't have this field yet
            notes: account.description || ""
          });
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching account:', error);
          alert("Failed to fetch account details.");
          navigate("/accounts");
        }
      };

      fetchAccountData();
    }
  }, [id, isEditMode, navigate, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: inputValue });
    
    // Clear the error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.accountName.trim()) errors.accountName = "Account name is required";
    if (!formData.accountType) errors.accountType = "Account type is required";
    if (!formData.initialBalance) {
      errors.initialBalance = "Initial balance is required";
    } else if (isNaN(parseFloat(formData.initialBalance))) {
      errors.initialBalance = "Please enter a valid number";
    } else if (formData.accountType !== "Credit Card" && parseFloat(formData.initialBalance) < 0) {
      errors.initialBalance = "Initial balance cannot be negative for non-credit accounts";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("You must be logged in to perform this action");
      navigate("/login");
      return;
    }
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // Prepare data for API
        const accountData = {
          name: formData.accountName,
          type: formData.accountType,
          balance: parseFloat(formData.initialBalance),
          currency: formData.currency,
          description: formData.notes
        };
        
        console.log('Sending account data:', accountData);
        console.log('Auth token:', currentUser?.token);
        
        let response;
          if (isEditMode) {
          // Update existing account
          response = await fetch(`http://localhost:5000/api/accounts/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(accountData)
          });
        } else {
          // Create new account
          response = await fetch('http://localhost:5000/api/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(accountData)
          });
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          
          try {
            // Try to parse as JSON if possible
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || 'Failed to save account');
          } catch (e) {
            // If not valid JSON, use the text response
            throw new Error(`Failed to save account: ${errorText.substring(0, 100)}...`);
          }
        }
        
        const savedAccount = await response.json();
        console.log('Account saved:', savedAccount);
        
        // Show success notification
        if (isEditMode) {
          alert("Account updated successfully!");
        } else {
          alert("Account added successfully!");
        }
          // Redirect to dashboard page
        navigate("/dashboard");
      } catch (error) {
        console.error("Error submitting form:", error);
        alert(`There was an error ${isEditMode ? "updating" : "adding"} your account: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="add-account-page">
        <DashboardNav />
        <main className="account-container">
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading account information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="add-account-page">
      <DashboardNav />
      <main className="account-container">
        <div className="page-header">
          <h1>{isEditMode ? "Edit Account" : "Add New Account"}</h1>
          <p className="subtitle">
            {isEditMode 
              ? "Update your account information" 
              : "Connect your accounts to track your finances in one place"}
          </p>
        </div>
        
        <div className="account-form-container">
          <form className="account-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Account Information</h2>
              
              <div className="form-group">
                <label htmlFor="accountName">Account Name*</label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="e.g., Chase Checking"
                  className={formErrors.accountName ? "error-input" : ""}
                />
                {formErrors.accountName && <p className="error">{formErrors.accountName}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="accountType">Account Type*</label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className={formErrors.accountType ? "error-input" : ""}
                >
                  <option value="">Select Account Type</option>
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Investment">Investment</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.accountType && <p className="error">{formErrors.accountType}</p>}
              </div>
            </div>
            
            <div className="form-section">
              <h2>Balance Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="initialBalance">
                    {isEditMode ? "Current Balance*" : "Initial Balance*"}
                  </label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">$</span>
                    <input
                      type="number"
                      id="initialBalance"
                      name="initialBalance"
                      value={formData.initialBalance}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="0.00"
                      className={formErrors.initialBalance ? "error-input with-icon" : "with-icon"}
                    />
                  </div>
                  {formErrors.initialBalance && <p className="error">{formErrors.initialBalance}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Additional Details</h2>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />
                <label htmlFor="isDefault">Set as default account</label>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional information about this account"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isEditMode ? "Updating Account..." : "Adding Account...") 
                  : (isEditMode ? "Update Account" : "Add Account")}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddAccountPage;
