const express = require('express');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const { verifyUserToken } = require('../utils/authMiddleware');
const router = express.Router();

// Route to add a favorite item
router.post('/', verifyUserToken, addFavorite);

// Route to remove a favorite item by ID
router.delete('/:id', verifyUserToken, removeFavorite);

// Route to get all favorite items for the authenticated user
router.get('/', verifyUserToken, getFavorites);

module.exports = router;
