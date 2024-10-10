
const jwt = require('jsonwebtoken');




 exports.verifyUserToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Get token from the Authorization header
    
    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided' });
    }
  
    const token = authHeader.split(' ')[1]; // Remove 'Bearer' and get the token
  
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized or invalid token' });
        }

        // Token is valid, attach the decoded info (like userId and any other relevant info) to request object
        req.user = { id: decoded.userId, role: decoded.role }; // Store user info in req.user
        console.log(req.user);
        next(); // Call next middleware or route handler
    });
};

  




  

