// routes/messageRoute.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyUserToken } = require('../utils/authMiddleware');
// Route to send a new message
router.post('/', verifyUserToken, messageController.sendMessage);

// Route to get message history for a specific item
router.get('/history/:otherUserId', verifyUserToken, messageController.getMessageHistory);

// Route to mark a message as read
router.patch('/:messageId/read', verifyUserToken, messageController.markAsRead);

// Route to reply to a message
router.post('/:messageId/reply', verifyUserToken, messageController.replyToMessage);

// Define the route to send a message to admin
router.post('/sendToAdmin', verifyUserToken,messageController.sendMessageToAdmin);
module.exports = router;
