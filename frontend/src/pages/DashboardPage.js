import React, { useState, useEffect } from 'react';
import DashboardNav from '../components/DashboardNav';
import './DashboardPage.css';
import { useAuth } from '../contexts/AuthContext';

// Helper function to safely format currency values
const formatCurrency = (value) => {
  // Check if value is undefined, null, or not a number
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "0.00";
  }
  return Number(value).toFixed(2);
};

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDeleteBudgetModal, setShowDeleteBudgetModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  
  // Fetch user's data from the backend
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch accounts
        const accountsResponse = await fetch('http://localhost:5000/api/accounts', {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        // Fetch budgets
        const budgetsResponse = await fetch('http://localhost:5000/api/budgets', {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        // Fetch transactions
        const transactionsResponse = await fetch('http://localhost:5000/api/transactions', {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        if (!accountsResponse.ok || !budgetsResponse.ok || !transactionsResponse.ok) {
          throw new Error('Failed to fetch data');
        }
          const accountsData = await accountsResponse.json();
        const budgetsData = await budgetsResponse.json();
        const transactionsData = await transactionsResponse.json();
        
        // Log data for debugging
        console.log('Budgets data received:', budgetsData);
        console.log('Sample budget object structure:', budgetsData.length > 0 ? budgetsData[0] : 'No budget data');
        
        // Ensure data has the expected structure before setting state
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
        setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);
    // Calculate total balance across all accounts
  const totalBalance = accounts?.length ? accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0) : 0;
    // Calculate total budgeted and spent amounts
  const totalBudgeted = budgets?.length ? budgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0) : 0;
  const totalSpent = budgets?.length ? budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0) : 0;
  console.log('Total budgeted:', totalBudgeted, 'Total spent:', totalSpent);
  const remainingBudget = totalBudgeted - totalSpent;
    // Handle editing an account
  const handleEditAccount = (account) => {
    // Navigate to edit account page with the account ID
    window.location.href = `/edit-account/${account._id}`;
  };

  // Handle opening the delete confirmation modal for accounts
  const handleDeleteClick = (account) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
  };

  // Handle confirming account deletion
  const handleConfirmDelete = async () => {
    if (!selectedAccount) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/accounts/${selectedAccount._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      // Remove the deleted account from state
      setAccounts(accounts.filter(account => account._id !== selectedAccount._id));
      setShowDeleteModal(false);
      setSelectedAccount(null);
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  // Cancel delete operation for accounts
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedAccount(null);
  };

  // Handle editing a budget
  const handleEditBudget = (budget) => {
    // Navigate to edit budget page with the budget ID
    window.location.href = `/edit-budget/${budget._id}`;
  };

  // Handle opening the delete budget confirmation modal
  const handleDeleteBudgetClick = (budget) => {
    setSelectedBudget(budget);
    setShowDeleteBudgetModal(true);
  };

  // Handle confirming budget deletion
  const handleConfirmBudgetDelete = async () => {
    if (!selectedBudget) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/budgets/${selectedBudget._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }
      
      // Remove the deleted budget from state
      setBudgets(budgets.filter(budget => budget._id !== selectedBudget._id));
      setShowDeleteBudgetModal(false);
      setSelectedBudget(null);
    } catch (err) {
      console.error('Error deleting budget:', err);
      alert('Failed to delete budget. Please try again.');
    }
  };

  // Cancel budget delete operation
  const handleCancelBudgetDelete = () => {
    setShowDeleteBudgetModal(false);
    setSelectedBudget(null);
  };
  
  // Get recent transactions (most recent 5)
  const recentTransactions = transactions?.length 
    ? [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    : [];
  // Calculate spending by category for the chart
  const spendingByCategory = budgets?.length && totalSpent > 0
    ? budgets.map(budget => ({
        category: budget.category || 'Uncategorized',
        percentage: Math.round(((Number(budget.spent) || 0) / totalSpent) * 100) || 0
      }))
    : [];

  return (
    <div className="dashboard-container">
      <DashboardNav />
      <div className="dashboard-header">
        <h1 className="welcome-message">Welcome back, {currentUser?.firstName || 'User'}!</h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <p className="loading-message">Loading your dashboard...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="dashboard-summary" id='dashboard-summary'>
            <div className="summary-card">
              <h2>Account Balance</h2>
              <p className="summary-amount">Rs. {formatCurrency(totalBalance)}</p>
            </div>
            
            <div className="summary-card">
              <h2>Monthly Budget</h2>
              <p className="summary-amount">Rs. {formatCurrency(totalBudgeted)}</p>
              <div className="budget-progress">
                <div 
                  className="budget-progress-bar" 
                  style={{ width: `${totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0}%` }}
                ></div>
              </div>
              <p className="budget-status">
                Rs. {formatCurrency(totalSpent)} spent of Rs. {formatCurrency(totalBudgeted)}
              </p>
            </div>
            
            <div className="summary-card">
              <h2>Remaining Budget</h2>
              <p className={`summary-amount ${remainingBudget < 0 ? 'negative' : 'positive'}`}>
                Rs. {formatCurrency(remainingBudget)}
              </p>
            </div>
          </div>
          
          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h2>Recent Transactions</h2>
              <div className="transactions-list" id='transactions-list'>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map(transaction => (
                        <tr key={transaction._id}>
                          <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}</td>
                          <td>{transaction.description || 'N/A'}</td>
                          <td>{transaction.category || 'N/A'}</td>                          <td className={Number(transaction.amount) < 0 ? 'negative' : 'positive'}>
                            Rs. {formatCurrency(Math.abs(Number(transaction.amount) || 0))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="no-data">No recent transactions</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <a href="/transactions" className="view-all-link">View All Transactions</a>
            </section>
            
            <section className="dashboard-section">
              <h2>Budget Categories</h2>              <div className="budget-categories" id="goals-section">
                {budgets.length > 0 ? (
                  budgets.map(budget => (
                    <div className="budget-category" key={budget._id}>
                      <div className="budget-content">                        <div className="category-header">
                          <div className="category-title">
                            <h3>{budget.name || budget.category || 'Uncategorized'}</h3>
                            {budget.name && budget.category && budget.name !== budget.category && 
                              <span className="category-tag">{budget.category}</span>
                            }
                          </div>
                          <p>Rs. {formatCurrency(budget.spent)} / Rs. {formatCurrency(budget.amount)}</p>
                        </div>
                        <div className="category-progress">
                          <div 
                            className="category-progress-bar" 
                            style={{ 
                              width: `${Number(budget.amount) > 0 ? Math.min((Number(budget.spent || 0) / Number(budget.amount)) * 100, 100) : 0}%`,
                              backgroundColor: Number(budget.spent || 0) > Number(budget.amount || 0) ? '#e74c3c' : '#3498db' 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="budget-actions">
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleEditBudget(budget)}
                          aria-label="Edit budget"
                          title="Edit budget"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDeleteBudgetClick(budget)}
                          aria-label="Delete budget"
                          title="Delete budget"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No budget categories defined</p>
                )}
              </div>
              <a href="/create-budget" className="view-all-link">Create New Budget</a>
            </section>
          </div>

          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h2>Accounts Overview</h2>              <div className="accounts-list">
                {accounts.length > 0 ? (
                  accounts.map(account => (
                    <div className="account-item" key={account._id}>
                      <div className="account-details">
                        <div className="account-info">
                          <h3>{account.name || 'Unnamed Account'}</h3>
                          <p className="account-type">{account.type || 'N/A'}</p>
                        </div>                        <p className={Number(account.balance) < 0 ? 'negative' : 'positive'}>
                          Rs. {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <div className="account-actions">
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleEditAccount(account)}
                          aria-label="Edit account"
                          title="Edit account"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDeleteClick(account)}
                          aria-label="Delete account"
                          title="Delete account"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No accounts available</p>
                )}
              </div>
              <a href="/add-account" className="view-all-link">Add New Account</a>
            </section>
            
            <section className="dashboard-section">
              <h2>Spending by Category</h2>
              <div className="spending-chart">
                {spendingByCategory.length > 0 ? (
                  spendingByCategory.map(item => (
                    <div className="chart-item" key={item.category}>
                      <div className="chart-label">
                        <span className="category-name">{item.category}</span>
                        <span className="category-percentage">{item.percentage}%</span>
                      </div>
                      <div className="chart-bar-container">
                        <div
                          className="chart-bar"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: getColorForCategory(item.category)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No spending data available</p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Accounts */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Account</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete the account "{selectedAccount?.name}"?</p>
              <p>This action cannot be undone. All transaction history for this account will be lost.</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleConfirmDelete}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Budgets */}
      {showDeleteBudgetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Budget</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete the budget for "{selectedBudget?.category}"?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={handleCancelBudgetDelete}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleConfirmBudgetDelete}>
                Delete Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate different colors for different categories
const getColorForCategory = (category) => {
  // Simple hash function to generate consistent colors for categories
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to RGB color with good saturation and brightness
  let hue = hash % 360;
  return `hsl(${hue}, 70%, 45%)`;
};

export default DashboardPage;