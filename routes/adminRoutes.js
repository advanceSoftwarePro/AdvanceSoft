const express = require('express');
const AdminController = require('../controllers/AdminController');
const { verifyUserToken } = require('../utils/authMiddleware');
const router = express.Router();

router.get('/statistics',verifyUserToken, AdminController.getStatistics);

module.exports = router;
