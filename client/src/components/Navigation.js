import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/" className={isActive('/')}>BookNook</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/shop" className={`nav-link ${isActive('/shop')}`}>Shop</Link>
            <Link to="/cart" className={`nav-link ${isActive('/cart')}`}>
              Cart {user?.cartCount ? `(${user.cartCount})` : ''}
            </Link>
            <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>Orders</Link>
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>Profile</Link>
            <button onClick={handleLogout} className="nav-link logout-btn">
              Logout
            </button>
            <span className="welcome-user">Welcome, {user?.name}</span>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link>
            <Link to="/register" className={`nav-link ${isActive('/register')}`}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 