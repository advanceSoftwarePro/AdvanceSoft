const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];  // Extract token from 'Bearer <token>'

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = user;  // Attach the decoded user info to the request
      next();  // Proceed to the next middleware or route handler
    });
  } else {
    res.status(401).json({ message: 'Authorization token is required' });
  }
};

module.exports = authenticateJWT;
