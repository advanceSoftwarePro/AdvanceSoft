const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

router.get('/statistics', AdminController.getStatistics);

module.exports = router;
