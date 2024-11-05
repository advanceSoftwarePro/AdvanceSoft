const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../utils/authMiddleware'); // Ensure correct path to your middleware

// Protect routes with the authentication middleware
router.post('/', authMiddleware.verifyUserToken, reviewController.createReview);
router.get('/:item_id', authMiddleware.verifyUserToken,reviewController.getReviewsByItemId);
router.put('/:id', authMiddleware.verifyUserToken, reviewController.updateReview);
router.delete('/:id', authMiddleware.verifyUserToken, reviewController.deleteReview);

module.exports = router;
