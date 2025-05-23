import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import DashboardNav from "../components/DashboardNav";
import Footer from "../components/Footer";
import "./TransactionsPage.css";
import { useAuth } from "../contexts/AuthContext";

// Transaction categories from the model
const TRANSACTION_CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare',
  'Insurance', 'Debt', 'Personal', 'Entertainment', 'Education',
  'Salary', 'Gifts', 'Refund', 'Investment', 'Transfer', 'Other'
];

// Sample transaction data for fallback
const sampleTransactions = [
  {
    id: 1,
    date: "2023-04-15",
    description: "Grocery Shopping",
    category: "Food",
    amount: -120.45,
    account: "Checking Account"
  },
  {
    id: 2,
    date: "2023-04-14",
    description: "Salary Deposit",
    category: "Income",
    amount: 2500.00,
    account: "Checking Account"
  },
  {
    id: 3,
    date: "2023-04-13",
    description: "Electric Bill",
    category: "Utilities",
    amount: -85.20,
    account: "Credit Card"
  },
  {
    id: 4,
    date: "2023-04-12",
    description: "Restaurant Dinner",
    category: "Dining Out",
    amount: -64.80,
    account: "Credit Card"
  },
  {
    id: 5,
    date: "2023-04-10",
    description: "Gas Station",
    category: "Transportation",
    amount: -45.00,
    account: "Credit Card"
  },
  {
    id: 6,
    date: "2023-04-08",
    description: "Movie Tickets",
    category: "Entertainment",
    amount: -32.50,
    account: "Checking Account"
  },
  {
    id: 7,
    date: "2023-04-05",
    description: "Freelance Payment",
    category: "Income",
    amount: 350.00,
    account: "Savings Account"
  },
  {
    id: 8,
    date: "2023-04-03",
    description: "Internet Bill",
    category: "Utilities",
    amount: -75.00,
    account: "Checking Account"
  },
  {
    id: 9,
    date: "2023-04-02",
    description: "Gym Membership",
    category: "Health & Fitness",
    amount: -50.00,
    account: "Credit Card"
  },
  {
    id: 10,
    date: "2023-04-01",
    description: "Phone Bill",
    category: "Utilities",
    amount: -65.00,
    account: "Checking Account"
  }
];

const TransactionsPage = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
    account: "",
    transactionType: "all"
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [accounts, setAccounts] = useState([]);
  
  // For the Add Transaction modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    account: "",
    type: "expense",
    amount: "",
    description: "",
    category: "Other",
    date: new Date().toISOString().split('T')[0],
    toAccount: "",
    notes: ""
  });
  // For the Edit Transaction modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get unique categories from actual data for filter dropdowns
  const categories = [...new Set(transactions.map(t => t.category))];

  // Check if mobile view should be used
  useLayoutEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth <= 480);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  // Fetch user accounts
  const fetchAccounts = useCallback(async () => {
    if (!currentUser?.token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/accounts', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      
      const data = await response.json();
      setAccounts(data);
      
      // Set default account in form if accounts exist
      if (data.length > 0 && !transactionForm.account) {
        setTransactionForm(prev => ({
          ...prev,
          account: data[0]._id
        }));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, [currentUser, transactionForm.account]);

  // Fetch transactions data
  const fetchTransactions = useCallback(async () => {
    if (!currentUser?.token) return;
    
    try {
      setLoading(true);
      
      // Build query parameters based on filters
      const params = new URLSearchParams();
      
      if (filters.dateFrom) params.append('startDate', filters.dateFrom);
      if (filters.dateTo) params.append('endDate', filters.dateTo);
      if (filters.category) params.append('category', filters.category);
      if (filters.account) params.append('account', filters.account);
      
      // Convert UI filter types to API types
      if (filters.transactionType === "income") {
        params.append('type', 'income');
      } else if (filters.transactionType === "expense") {
        params.append('type', 'expense');
      } else if (filters.transactionType === "transfer") {
        params.append('type', 'transfer');
      }
      
      if (searchTerm) params.append('search', searchTerm);
      
      // Make the API call
      const response = await fetch(`http://localhost:5000/api/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      const transactionsData = data.transactions || [];
      
      // Format transactions for display
      const formattedTransactions = transactionsData.map(t => ({
        ...t,
        // Get account name from populated account field
        accountName: t.account?.name || 'Unknown Account'
      }));
      
      setTransactions(formattedTransactions);
      setFilteredTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // If API fails, use sample data as fallback
      setTransactions(sampleTransactions);
      setFilteredTransactions(sampleTransactions);
    } finally {
      setLoading(false);
    }
  }, [currentUser, filters, searchTerm]);
  
  // Initial fetch of accounts and transactions
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  // We now use backend filtering via API parameters in fetchTransactions

  // Form handling for adding new transactions
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for amount to ensure it's always positive in the form
    if (name === 'amount') {
      // Remove any negative signs and non-numeric characters except decimal point
      const sanitizedValue = value.replace(/-/g, '').replace(/[^\d.]/g, '');
      
      setTransactionForm(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setTransactionForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  // Validate the transaction form
  const validateForm = (formData = transactionForm) => {
    const errors = {};
    
    if (!formData.account) {
      errors.account = 'Please select an account';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'Please enter a description';
    }
    
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    if (!formData.date) {
      errors.date = 'Please select a date';
    }
    
    // For transfers, validate the destination account
    if (formData.type === 'transfer') {
      if (!formData.toAccount) {
        errors.toAccount = 'Please select a destination account';
      }
      
      if (formData.toAccount === formData.account) {
        errors.toAccount = 'Cannot transfer to the same account';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the transaction form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare transaction data
      const transactionData = {
        account: transactionForm.account,
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        category: transactionForm.category,
        date: transactionForm.date,
        notes: transactionForm.notes
      };
      
      // Add toAccount for transfers
      if (transactionForm.type === 'transfer') {
        transactionData.toAccount = transactionForm.toAccount;
      }
      
      // Send request to API
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(transactionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create transaction');
      }
      
      // Close modal and reset form
      setShowAddModal(false);
      setTransactionForm({
        account: accounts.length > 0 ? accounts[0]._id : "",
        type: "expense",
        amount: "",
        description: "",
        category: "Other",
        date: new Date().toISOString().split('T')[0],
        toAccount: "",
        notes: ""
      });
      
      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      setFormErrors({
        ...formErrors,
        general: error.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete transaction');
        }
        
        // Refresh transactions
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  // Handle editing a transaction
  const handleEditTransaction = (transaction) => {
    // Prepare the form data for editing
    const formData = {
      _id: transaction._id,
      account: transaction.account?._id || transaction.account,
      type: transaction.type || 'expense',
      amount: Math.abs(Number(transaction.amount)).toString(),
      description: transaction.description || '',
      category: transaction.category || 'Other',
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: transaction.notes || '',
      toAccount: transaction.toAccount?._id || transaction.toAccount || ''
    };
    
    // Set the form data and toggle the edit modal
    setEditingTransaction(formData);
    setShowEditModal(true);
  };

  // Handle saving edited transaction
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(editingTransaction)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare transaction data for update
      const transactionData = {
        account: editingTransaction.account,
        type: editingTransaction.type,
        amount: parseFloat(editingTransaction.amount),
        description: editingTransaction.description,
        category: editingTransaction.category,
        date: editingTransaction.date,
        notes: editingTransaction.notes
      };
      
      // Add toAccount for transfers
      if (editingTransaction.type === 'transfer' && editingTransaction.toAccount) {
        transactionData.toAccount = editingTransaction.toAccount;
      }
      
      // Send request to API
      const response = await fetch(`http://localhost:5000/api/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(transactionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update transaction');
      }
      
      // Close modal and reset editing state
      setShowEditModal(false);
      setEditingTransaction(null);
      
      // Refresh transactions
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      setFormErrors({
        ...formErrors,
        general: error.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form change for edit modal
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for amount to ensure it's always positive in the form
    if (name === 'amount') {
      // Remove any negative signs and non-numeric characters except decimal point
      const sanitizedValue = value.replace(/-/g, '').replace(/[^\d.]/g, '');
      
      setEditingTransaction(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setEditingTransaction(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      category: "",
      account: "",
      transactionType: "all"
    });
    setSearchTerm("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  // Card view for mobile
  const renderMobileCards = () => {
    if (filteredTransactions.length === 0) {
      return (
        <div className="no-transactions">
          <i className="fas fa-receipt"></i>
          <h3>No transactions found</h3>
          <p>Try adjusting your filters or add new transactions</p>
        </div>
      );
    }
    
    return (
      <div className="transactions-cards">
        {filteredTransactions.map(transaction => (
          <div 
            key={transaction._id} 
            className={`transaction-card ${transaction.type}`}
          >
            <div className="transaction-card-header">
              <h3>{transaction.description}</h3>              <span className={transaction.type === 'expense' ? 'negative' : 'positive'}>
                Rs. {Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
            <div className="transaction-card-details">
              <div className="transaction-card-info">
                <div className="info-item">
                  <span className="info-label">Date:</span>
                  <span className="info-value">{formatDate(transaction.date)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Category:</span>
                  <span className="category-tag">{transaction.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Account:</span>
                  <span className="info-value">{transaction.accountName}</span>
                </div>
                {transaction.type === 'transfer' && (
                  <div className="info-item">
                    <span className="info-label">To Account:</span>
                    <span className="info-value">{transaction.toAccount?.name || 'Unknown'}</span>
                  </div>
                )}
              </div>              <div className="transaction-card-actions">
                <button 
                  className="action-btn edit-btn"
                  title="Edit transaction"
                  aria-label="Edit transaction"
                  onClick={() => {
                    setEditingTransaction(transaction);
                    setTransactionForm({
                      account: transaction.account._id,
                      type: transaction.type,
                      amount: Math.abs(transaction.amount),
                      description: transaction.description,
                      category: transaction.category,
                      date: transaction.date.split('T')[0],
                      toAccount: transaction.toAccount ? transaction.toAccount._id : "",
                      notes: transaction.notes
                    });
                    setShowEditModal(true);
                  }}
                >
                  ✏️
                </button>
                <button 
                  className="action-btn delete-btn"
                  title="Delete transaction"
                  aria-label="Delete transaction"
                  onClick={() => handleDeleteTransaction(transaction._id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  // Render table view (original)
  const renderTableView = () => {
    if (filteredTransactions.length === 0) {
      return (
        <div className="no-transactions">
          <i className="fas fa-receipt"></i>
          <h3>No transactions found</h3>
          <p>Try adjusting your filters or add new transactions</p>
        </div>
      );
    }
    
    return (
      <div className="transactions-list">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Category</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction._id} className={`transaction-row ${transaction.type}`}>
                <td>{formatDate(transaction.date)}</td>
                <td>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </td>
                <td>{transaction.description}</td>
                <td>
                  <span className="category-tag">{transaction.category}</span>
                </td>
                <td>
                  {transaction.accountName}
                  {transaction.type === 'transfer' && transaction.toAccount && (
                    <span className="transfer-indicator"> → {transaction.toAccount.name}</span>
                  )}
                </td>                <td className={transaction.type === 'expense' ? 'negative' : 'positive'}>
                  Rs. {Math.abs(transaction.amount).toFixed(2)}
                </td>                <td className="action-buttons">
                  <button 
                    className="action-btn edit-btn" 
                    title="Edit transaction"
                    aria-label="Edit transaction"
                    onClick={() => {
                      setEditingTransaction(transaction);
                      setTransactionForm({
                        account: transaction.account._id,
                        type: transaction.type,
                        amount: Math.abs(transaction.amount),
                        description: transaction.description,
                        category: transaction.category,
                        date: transaction.date.split('T')[0],
                        toAccount: transaction.toAccount ? transaction.toAccount._id : "",
                        notes: transaction.notes
                      });
                      setShowEditModal(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    title="Delete transaction"
                    aria-label="Delete transaction"
                    onClick={() => handleDeleteTransaction(transaction._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Add Transaction Modal
  const renderAddTransactionModal = () => {
    if (!showAddModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Add New Transaction</h2>
            <button className="close-modal" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          
          <form className="transaction-form" onSubmit={handleFormSubmit}>
            {formErrors.general && <div className="error-message">{formErrors.general}</div>}
            
            <div className="form-group">
              <label>Transaction Type</label>
              <div className="transaction-type-selector">
                <button 
                  type="button"
                  className={`type-btn ${transactionForm.type === 'expense' ? 'active' : ''}`}
                  onClick={() => setTransactionForm({...transactionForm, type: 'expense'})}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  className={`type-btn ${transactionForm.type === 'income' ? 'active' : ''}`}
                  onClick={() => setTransactionForm({...transactionForm, type: 'income'})}
                >
                  Income
                </button>
                <button 
                  type="button"
                  className={`type-btn ${transactionForm.type === 'transfer' ? 'active' : ''}`}
                  onClick={() => setTransactionForm({...transactionForm, type: 'transfer'})}
                >
                  Transfer
                </button>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="account">From Account</label>
                <select
                  id="account"
                  name="account"
                  value={transactionForm.account}
                  onChange={handleFormChange}
                  className={formErrors.account ? 'input-error' : ''}
                >
                  <option value="">Select Account</option>                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.name} (Rs. {account.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
                {formErrors.account && <div className="error-text">{formErrors.account}</div>}
              </div>
              
              {transactionForm.type === 'transfer' && (
                <div className="form-group">
                  <label htmlFor="toAccount">To Account</label>
                  <select
                    id="toAccount"
                    name="toAccount"
                    value={transactionForm.toAccount}
                    onChange={handleFormChange}
                    className={formErrors.toAccount ? 'input-error' : ''}
                  >
                    <option value="">Select Account</option>
                    {accounts
                      .filter(account => account._id !== transactionForm.account)
                      .map(account => (
                        <option key={account._id} value={account._id}>
                          {account.name} (Rs. {account.balance.toFixed(2)})
                        </option>
                      ))}
                  </select>
                  {formErrors.toAccount && <div className="error-text">{formErrors.toAccount}</div>}
                </div>
              )}
            </div>
              <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <div className="input-with-icon">
                <span className="currency-icon">Rs.</span>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={transactionForm.amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  className={formErrors.amount ? 'input-error' : ''}
                />
              </div>
              {formErrors.amount && <div className="error-text">{formErrors.amount}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={transactionForm.description}
                onChange={handleFormChange}
                placeholder="e.g., Grocery shopping"
                className={formErrors.description ? 'input-error' : ''}
              />
              {formErrors.description && <div className="error-text">{formErrors.description}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={transactionForm.category}
                  onChange={handleFormChange}
                  className={formErrors.category ? 'input-error' : ''}
                >
                  {TRANSACTION_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {formErrors.category && <div className="error-text">{formErrors.category}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={transactionForm.date}
                  onChange={handleFormChange}
                  className={formErrors.date ? 'input-error' : ''}
                />
                {formErrors.date && <div className="error-text">{formErrors.date}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={transactionForm.notes}
                onChange={handleFormChange}
                placeholder="Add any additional details"
              ></textarea>
            </div>
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render Edit Transaction Modal
  const renderEditTransactionModal = () => {
    if (!showEditModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Edit Transaction</h2>
            <button className="close-modal" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          
          <form className="transaction-form" onSubmit={handleSaveEdit}>
            {formErrors.general && <div className="error-message">{formErrors.general}</div>}
            
            <div className="form-group">
              <label>Transaction Type</label>
              <div className="transaction-type-selector">
                <button 
                  type="button"
                  className={`type-btn ${editingTransaction.type === 'expense' ? 'active' : ''}`}
                  onClick={() => setEditingTransaction({...editingTransaction, type: 'expense'})}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  className={`type-btn ${editingTransaction.type === 'income' ? 'active' : ''}`}
                  onClick={() => setEditingTransaction({...editingTransaction, type: 'income'})}
                >
                  Income
                </button>
                <button 
                  type="button"
                  className={`type-btn ${editingTransaction.type === 'transfer' ? 'active' : ''}`}
                  onClick={() => setEditingTransaction({...editingTransaction, type: 'transfer'})}
                >
                  Transfer
                </button>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="account">From Account</label>
                <select
                  id="account"
                  name="account"
                  value={editingTransaction.account}
                  onChange={handleEditFormChange}
                  className={formErrors.account ? 'input-error' : ''}
                >
                  <option value="">Select Account</option>                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.name} (Rs. {account.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
                {formErrors.account && <div className="error-text">{formErrors.account}</div>}
              </div>
              
              {editingTransaction.type === 'transfer' && (
                <div className="form-group">
                  <label htmlFor="toAccount">To Account</label>
                  <select
                    id="toAccount"
                    name="toAccount"
                    value={editingTransaction.toAccount}
                    onChange={handleEditFormChange}
                    className={formErrors.toAccount ? 'input-error' : ''}
                  >
                    <option value="">Select Account</option>
                    {accounts
                      .filter(account => account._id !== editingTransaction.account)
                      .map(account => (
                        <option key={account._id} value={account._id}>
                          {account.name} (Rs. {account.balance.toFixed(2)})
                        </option>
                      ))}
                  </select>
                  {formErrors.toAccount && <div className="error-text">{formErrors.toAccount}</div>}
                </div>
              )}
            </div>
              <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <div className="input-with-icon">
                <span className="currency-icon">Rs.</span>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={editingTransaction.amount}
                  onChange={handleEditFormChange}
                  placeholder="0.00"
                  className={formErrors.amount ? 'input-error' : ''}
                />
              </div>
              {formErrors.amount && <div className="error-text">{formErrors.amount}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={editingTransaction.description}
                onChange={handleEditFormChange}
                placeholder="e.g., Grocery shopping"
                className={formErrors.description ? 'input-error' : ''}
              />
              {formErrors.description && <div className="error-text">{formErrors.description}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={editingTransaction.category}
                  onChange={handleEditFormChange}
                  className={formErrors.category ? 'input-error' : ''}
                >
                  {TRANSACTION_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {formErrors.category && <div className="error-text">{formErrors.category}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={editingTransaction.date}
                  onChange={handleEditFormChange}
                  className={formErrors.date ? 'input-error' : ''}
                />
                {formErrors.date && <div className="error-text">{formErrors.date}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={editingTransaction.notes}
                onChange={handleEditFormChange}
                placeholder="Add any additional details"
              ></textarea>
            </div>
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="transactions-page">
      <DashboardNav />
      
      <main className="transactions-content">
        <div className="page-header">
          <h1>Transactions</h1>
          <div className="actions">
            <button className="export-btn">
              <i className="fas fa-file-export"></i> Export
            </button>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus"></i> Add Transaction
            </button>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group date-range-group">
              <label>Date Range</label>
              <div className="date-range">
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
                <span>to</span>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
              <div className="filter-group">
              <label>Account</label>
              <select
                name="account"
                value={filters.account}
                onChange={handleFilterChange}
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account._id} value={account._id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Type</label>
              <select
                name="transactionType"
                value={filters.transactionType}
                onChange={handleFilterChange}
              >
                <option value="all">All Transactions</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
            
            <button className="reset-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
          <div className="transactions-summary">
          <div className="summary-card">
            <h3>Total Transactions</h3>
            <p>{filteredTransactions.length}</p>
          </div>
          <div className="summary-card income">
            <h3>Total Income</h3>            <p>Rs. {filteredTransactions
              .filter(t => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}</p>
          </div>
          <div className="summary-card expense">
            <h3>Total Expenses</h3>            <p>Rs. {filteredTransactions
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}</p>
          </div>
          <div className="summary-card balance">
            <h3>Net Balance</h3>            <p className={
              filteredTransactions.reduce((sum, t) => {
                if (t.type === 'income') return sum + t.amount;
                if (t.type === 'expense') return sum - t.amount;
                return sum;
              }, 0) >= 0 ? "positive" : "negative"
            }>
              Rs. {filteredTransactions
                .reduce((sum, t) => {
                  if (t.type === 'income') return sum + t.amount;
                  if (t.type === 'expense') return sum - t.amount;
                  return sum;
                }, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="transactions-container">          {loading ? (
            <div className="loading-container">
              <p className="loading-message">Loading your transactions...</p>
            </div>
          ) : isMobileView ? (
            renderMobileCards()
          ) : (
            renderTableView()
          )}
        </div>
        
        {renderAddTransactionModal()}
        {renderEditTransactionModal()}
      </main>
      
      <Footer />
    </div>
  );
};

export default TransactionsPage;