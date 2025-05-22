import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('Fetched user profile:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        setUser(data);
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="no-profile">
          <p>No profile information available.</p>
          <button onClick={() => navigate('/login')} className="login-button">
            Login to View Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Profile Information</h2>
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-group">
            <label>Name</label>
            <p>{user.name}</p>
          </div>

          <div className="detail-group">
            <label>Email</label>
            <p>{user.email}</p>
          </div>

          <div className="detail-group">
            <label>Member Since</label>
            <p>{formatDate(user.createdAt)}</p>
          </div>

          <div className="detail-group">
            <label>Account Status</label>
            <p className="status active">Active</p>
          </div>

          <div className="detail-group">
            <label>Last Login</label>
            <p>{formatDate(user.lastLogin || user.createdAt)}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{user.orderCount || 0}</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user.cartCount || 0}</span>
            <span className="stat-label">Cart Items</span>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            onClick={() => navigate('/orders')} 
            className="action-button view-orders"
          >
            View Orders
          </button>
          <button 
            onClick={() => navigate('/shop')} 
            className="action-button continue-shopping"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 