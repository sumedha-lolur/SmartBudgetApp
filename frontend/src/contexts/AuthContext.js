import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    const email = localStorage.getItem('userEmail');
    
    if (token && firstName && lastName && email) {
      setCurrentUser({
        firstName,
        lastName,
        email,
        name: `${firstName} ${lastName}`,
        token
      });
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userFirstName', userData.firstName);
    localStorage.setItem('userLastName', userData.lastName);
    localStorage.setItem('userEmail', userData.email);
    if (userData.phone) {
      localStorage.setItem('userPhone', userData.phone);
    }
    
    setCurrentUser(userData);
  };

  const logout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
