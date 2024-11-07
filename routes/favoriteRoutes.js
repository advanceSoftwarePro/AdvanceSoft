const express = require('express');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const { verifyUserToken } = require('../utils/authMiddleware');
const router = express.Router();


router.post('/', verifyUserToken, addFavorite);
router.delete('/:id', verifyUserToken, removeFavorite);
router.get('/', verifyUserToken, getFavorites);

module.exports = router;
