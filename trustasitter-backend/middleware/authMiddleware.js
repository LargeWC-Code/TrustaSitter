const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('Auth middleware called for:', req.method, req.path);
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid authorization header found');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'Present' : 'Missing');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024');
    console.log('Token verified successfully for user:', decoded.email);
    req.user = decoded; // 
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
