const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth middleware - Request headers:', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? `${authHeader.substring(0, 20)}...` : 'none'
    });

    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.log('No token found in Authorization header');
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verification successful:', {
        userId: decoded.userId,
        tokenPreview: `${token.substring(0, 10)}...`
      });
      
      // Find user
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        console.log('User not found for token:', decoded.userId);
        return res.status(401).json({ error: 'User not found' });
      }

      console.log('User found:', {
        userId: user._id,
        email: user.email
      });

      // Add user to request object
      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification error:', {
        message: err.message,
        name: err.name,
        tokenPreview: `${token.substring(0, 10)}...`
      });
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error in auth middleware' });
  }
};

module.exports = auth; 