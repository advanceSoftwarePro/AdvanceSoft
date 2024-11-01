const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/PromotionController');

// Route to create a promotion
router.post('/create', PromotionController.createPromotion);

module.exports = router;
