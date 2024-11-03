const express = require('express');
const { addToWishlist, removeFromWishlist, getUserWishlist } = require('../controllers/wishlistController');
const { verifyUserToken } = require('../utils/authMiddleware');
const router = express.Router();

// Route to add an item to the wishlist
router.post('/', verifyUserToken, addToWishlist);

// Route to remove an item from the wishlist by ID
router.delete('/:id', verifyUserToken, removeFromWishlist);

// Route to get all wishlist items for the authenticated user
router.get('/', verifyUserToken, getUserWishlist);

module.exports = router;
