const express = require('express');
const ratingController = require('../controllers/ratingController'); // Ensure correct path
const { verifyUserToken } = require('../utils/authMiddleware'); // Ensure correct path

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyUserToken);

// Route to create a rating
router.post('/', ratingController.createRating);

// Route to get ratings for a specific user
router.get('/:userId', ratingController.getRatingsByUserId);

// Route to update a rating
router.put('/:userId', ratingController.updateRating);

// Route to delete a rating
router.delete('/:userId', ratingController.deleteRating);

module.exports = router;
