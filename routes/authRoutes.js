// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { validateEmail, handleValidationErrors } = require('../utils/validators');
const { verifyUserToken } = require('../utils/authMiddleware');
const router = express.Router();

// Registration route
router.post('/register', authController.register);
router.get('/verify/:token', authController.verifyEmail);


router.post('/confirm-owner-payment', authController.confirmOwnerPayment);
router.post('/register/owner', authController.registerOwner);
router.get('/verify/owner/:token', authController.verifyOwnerEmail);

router.post('/User/login',authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/User/logout',verifyUserToken,authController.logout);


module.exports = router;

