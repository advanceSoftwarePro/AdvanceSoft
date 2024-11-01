
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

router.post('/', wishlistController.addToWishlist);
router.get('/user/:user_id', wishlistController.getUserWishlist);
router.delete('/:id', wishlistController.removeFromWishlist);

module.exports = router;
