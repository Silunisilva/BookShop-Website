import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

// Import images
import loginImage from '../assets/images/login-image.jpg';
import registerImage from '../assets/images/register-image.jpg';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [currentImage, setCurrentImage] = useState(loginImage);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Debug logging
    console.log('Login Image URL:', loginImage);
    console.log('Register Image URL:', registerImage);
    console.log('Current Image URL:', currentImage);
  }, [currentImage]);

  useEffect(() => {
    setCurrentImage(isLogin ? loginImage : registerImage);
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        navigate('/profile');
      } else {
        setIsLogin(true);
        setFormData({ email: '', password: '', confirmPassword: '', name: '' });
      }
    } catch (err) {
      setError(err.message);
      document.querySelector('.auth-card').classList.add('error-shake');
      setTimeout(() => {
        document.querySelector('.auth-card').classList.remove('error-shake');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-image-section" style={{ border: '2px solid red' }}>
          <img 
            src={currentImage}
            alt={isLogin ? 'Welcome back to your reading journey' : 'Join our book community'} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              border: '2px solid blue'
            }}
            onError={(e) => {
              console.error('Image failed to load:', e);
              e.target.style.display = 'none';
            }}
            onLoad={() => console.log('Image loaded successfully')}
          />
        </div>
        
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2>{isLogin ? 'Welcome Back!' : 'Join Our Book Community'}</h2>
              <p>{isLogin ? 'Sign in to continue your reading journey' : 'Create an account to start your adventure'}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="form-group">
                  <div className="error-message">
                    <span role="img" aria-label="error">⚠️</span>
                    {error}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="social-auth">
              <button className="social-button">
                <img src="/google-icon.png" alt="Google" />
                Continue with Google
              </button>
              <button className="social-button">
                <img src="/facebook-icon.png" alt="Facebook" />
                Continue with Facebook
              </button>
            </div>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button 
                onClick={toggleMode} 
                className="auth-link"
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 