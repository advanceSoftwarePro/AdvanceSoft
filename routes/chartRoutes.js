// routes/chartRoutes.js
const express = require('express');
const router = express.Router();
const ChartController = require('../controllers/ChartController');

router.get('/chart-data', ChartController.getChartData);

module.exports = router;
