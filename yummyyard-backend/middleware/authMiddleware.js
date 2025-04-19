const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-key-change-this';

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
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


module.exports = { authenticateUser };
