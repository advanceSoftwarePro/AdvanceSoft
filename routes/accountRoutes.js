const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Route to deactivate an account
router.post('/api/accounts/deactivate', accountController.deactivateAccount);

// Route to reactivate an account
router.patch('/api/accounts/reactivate/:user_id', accountController.reactivateAccount);

module.exports = router;
