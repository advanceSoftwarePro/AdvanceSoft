const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/tokenBlacklist');

exports.verifyUserToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('Checking token:', token);

    const result = await TokenBlacklist.findOne({
      where: { token: token },
    });

    if (result) {
      return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized or invalid token' });
      }

      // Token is valid, attach the decoded info (like userId and any other relevant info) to request object
      req.user = { id: decoded.userId, role: decoded.role }; // Store user info in req.user
      next(); // Call next middleware or route handler
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  