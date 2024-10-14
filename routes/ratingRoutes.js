const express = require('express');
const ratingController = require('../controllers/ratingController');
const { verifyUserToken } = require('../utils/authMiddleware');
const router = express.Router();

// Route to submit a rating for a user
router.post('/users/:UserID/rate', verifyUserToken , ratingController.submitRating);
/*router.post('/users/:UserID/rate', verifyUserToken, (req, res, next) => {
    console.log('Rate user endpoint hit:', req.params.UserID);
    next();
}, ratingController.submitRating);
*/

module.exports = router;
