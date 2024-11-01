const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.post('/', favoriteController.addFavorite);
router.delete('/:id', favoriteController.removeFavorite);
router.get('/user/:user_id', favoriteController.getFavorites);

module.exports = router;