const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyUserToken } = require('../utils/authMiddleware'); // Import your middleware

// Route to deactivate an account with authentication
router.post('/api/accounts/deactivate', verifyUserToken, accountController.deactivateAccount);

// Route to reactivate an account
router.patch('/api/accounts/reactivate/:user_id', accountController.reactivateAccount);

module.exports = router;
