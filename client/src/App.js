import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Profile from './components/Profile';
import Footer from './components/Footer';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount and when storage changes
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
          console.log('Auth state updated:', { 
            isAuthenticated: true, 
            userId: parsedUser._id,
            tokenPreview: `${token.substring(0, 10)}...`
          });
        } catch (err) {
          console.error('Error parsing user data:', err);
          handleLogout();
        }
      } else {
        console.log('No auth data found, logging out');
        handleLogout();
      }
      setLoading(false);
    };

    // Initial check
    checkAuth();

    // Listen for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogin = (userData, token) => {
    try {
      if (!token || !userData) {
        throw new Error('Invalid login data');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      console.log('Login successful:', { 
        userId: userData._id,
        tokenPreview: `${token.substring(0, 10)}...`
      });
      navigate('/shop');
    } catch (err) {
      console.error('Error during login:', err);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    console.log('Logged out');
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Navigation 
        isAuthenticated={isAuthenticated} 
        user={user} 
        onLogout={handleLogout} 
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/shop" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                <Navigate to="/shop" replace />
              ) : (
                <Register onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/shop" 
            element={
              isAuthenticated ? (
                <Shop />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/cart" 
            element={
              isAuthenticated ? (
                <Cart />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/orders" 
            element={
              isAuthenticated ? (
                <Orders />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? (
                <Profile />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
