const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { verifyUserToken } = require('../utils/authMiddleware');
const rentalController = require('../controllers/rentalController');

router.get('/users', verifyUserToken,UserController.getAllUsers);
router.put('/users/:id',verifyUserToken, UserController.updateUser);
router.put('/users/:id/ban',verifyUserToken, UserController.banUser);
router.get('/rentals/completed',verifyUserToken,rentalController.getCompletedRentals);

module.exports = router;
