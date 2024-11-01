const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/users', UserController.getAllUsers);
router.put('/users/:id', UserController.updateUser);
router.put('/users/:id/ban', UserController.banUser);

module.exports = router;
