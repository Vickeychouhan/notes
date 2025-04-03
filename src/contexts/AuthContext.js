import React, { createContext, useContext, useState, useEffect } from 'react';
import adminService from '../services/adminConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize default admin if none exists
    adminService.initializeAdmin();
    
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const register = (username, email, password) => {
    return new Promise((resolve, reject) => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(user => user.username === username)) {
          reject(new Error('Username already exists'));
          return;
        }
        
        const newUser = {
          id: Date.now().toString(),
          username,
          email,
          password,
          isAdmin: false // New users are not admins by default
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        resolve(newUser);
      } catch (error) {
        reject(error);
      }
    });
  };

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(user => user.username === username && user.password === password);
        
        if (!user) {
          reject(new Error('Invalid username or password'));
          return;
        }
        
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        resolve(userWithoutPassword);
      } catch (error) {
        reject(error);
      }
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    isAdmin: currentUser?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}