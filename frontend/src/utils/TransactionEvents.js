/**
 * Utility file for handling transaction-related events between components
 */

// Notify other components (like Dashboard) that a transaction has been modified
export const notifyTransactionChange = () => {
  // Use localStorage to communicate between different components/pages
  localStorage.setItem('transactionUpdated', Date.now().toString());
  
  // Also dispatch a custom event for components on the same page
  const event = new CustomEvent('transactionUpdated', {
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(event);
};

// Function to set up a listener for transaction changes
export const setupTransactionChangeListener = (callback) => {
  // Function to handle storage changes (works across tabs/pages)
  const handleStorageChange = (e) => {
    if (e.key === 'transactionUpdated') {
      console.log('Detected transaction change via localStorage');
      callback();
    }
  };
  
  // Function to handle custom events (works within the same page)
  const handleCustomEvent = () => {
    console.log('Detected transaction change via custom event');
    callback();
  };
  
  // Set up listeners
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('transactionUpdated', handleCustomEvent);
  
  // Check if there's a pending update
  const lastUpdate = localStorage.getItem('transactionUpdated');
  if (lastUpdate) {
    // Remove the flag to prevent multiple components from responding to the same update
    localStorage.removeItem('transactionUpdated');
    console.log('Found pending transaction update, will refresh data');
    // Small timeout to ensure component is fully mounted before callback
    setTimeout(callback, 100);
  }
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('transactionUpdated', handleCustomEvent);
  };
};
