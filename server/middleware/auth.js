const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Extract token from Authorization header (Format: Bearer <token>)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ success: false, error: 'Unauthorized: Missing or invalid token format.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_ONLY');
    req.user = decoded;
    
    // Check role access if needed (optional generic check, but we can do it per route)
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin access required.' });
  }
};

module.exports = { verifyToken, requireAdmin };
