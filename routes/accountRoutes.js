const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyUserToken } = require('../utils/authMiddleware'); 

router.post('/api/accounts/deactivate', verifyUserToken, accountController.deactivateAccount);
router.patch('/api/accounts/reactivate/:user_id', accountController.reactivateAccount);

module.exports = router;
