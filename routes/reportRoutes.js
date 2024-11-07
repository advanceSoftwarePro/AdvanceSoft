const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');
const sequelize = require('../config/database'); 
const { verifyUserToken } = require('../utils/authMiddleware');


router.get('/pdf-report', verifyUserToken,reportController.createPDFReport);
router.get('/monthly-activity-report',verifyUserToken, reportController.createMonthlyActivityReport);
router.get('/revenue-report', verifyUserToken,reportController.createRevenueReport);
router.get('/user-report/:userID',verifyUserToken, reportController.createUserReport);

module.exports = router;
