
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'JWT_NEW_SECRET';


const authenticateUser = (req, res, next) => {
  // Check for token in Authorization header OR query parameter
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  
  let token;
  
  // Get token from Authorization header if present
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 
  // Otherwise try to get token from query parameter
  else if (queryToken) {
    token = queryToken;
  }
  
  // If no token found in either place, return unauthorized
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate that necessary user data exists in token
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ 
        message: 'Invalid token: missing user information'
      });
    }
    
    // Add user data to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name || null
    };
    
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Token is invalid' });
  }
};

// Add this new middleware for admin-only routes
const authenticateAdmin = (req, res, next) => {
  // First use the regular authentication
  authenticateUser(req, res, (err) => {
    if (err) return next(err);
    
    // Then check if the user is an admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // User is authenticated and is an admin
    next();
  });
};

module.exports = { 
  authenticateUser,
  authenticateAdmin 
};
