const express = require('express');
const { addToWishlist, removeFromWishlist, getUserWishlist } = require('../controllers/wishlistController');
const { verifyUserToken } = require('../utils/authMiddleware');
const router = express.Router();


router.post('/', verifyUserToken, addToWishlist);
router.delete('/:id', verifyUserToken, removeFromWishlist);
router.get('/', verifyUserToken, getUserWishlist);

module.exports = router;
