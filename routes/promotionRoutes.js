const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/PromotionController');
router.post('/create', PromotionController.createPromotion);

module.exports = router;
