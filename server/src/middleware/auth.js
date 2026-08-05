const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token missing or invalid' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pharmacy_super_secret_jwt_key_2026');
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password_hash'] } });

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token', error: error.message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of roles: ${roles.join(', ')}` });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
