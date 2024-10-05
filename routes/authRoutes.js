// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Registration route
router.post('/register', authController.register);
router.get('/verify/:token', authController.verifyEmail);


router.post('/confirm-owner-payment', authController.confirmOwnerPayment);
router.post('/register/owner', authController.registerOwner);
router.get('/verify/owner/:token', authController.verifyOwnerEmail);

router.post('/User/login',authController.login);
module.exports = router;

