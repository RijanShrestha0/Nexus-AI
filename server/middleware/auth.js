const jwt = require('jsonwebtoken');

// A flexible JWT secret token usually mapped to a real .env. Random string for standalone usage.
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secret_agentic_key_123';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token specifically provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token is improperly signed or strictly expired.' });
  }
};

module.exports = { verifyToken, JWT_SECRET };
