// controllers/messageController.js
const User = require('../models/User');
const Message = require('../models/message');

const { Op } = require('sequelize');

exports.sendMessage = async (req, res) => {
    try {
        const sender_id = req.user.id;  // Ensure 'UserID' is available in req.user
        const { receiver_email, message_text } = req.body;  // Destructure request body

        // Ensure the receiver exists
        const receiver = await User.findOne({ where: { Email: receiver_email } });
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        console.log("sender_id", sender_id);
        console.log("receiver.UserID", receiver.UserID);
        console.log("message_text", message_text);

        // Create the message record in the database
        const message = await Message.create({
            sender_id: sender_id,            // Map to SenderID
            receiver_id: receiver.UserID,    // Map to ReceiverID
            message_text: message_text,      // Map to MessageContent
        });

        res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};


// Get message history for a specific item

exports.getMessageHistory = async (req, res) => {
    try {
        const user_id = req.user.id;  // Extracted from token
        const otherUserId = parseInt(req.params.otherUserId, 10);  // Convert to integer

        console.log("req.params:", req.params);  // Log the request parameters
        console.log("user_id", user_id);
        console.log("otherUserId", otherUserId);

        if (isNaN(otherUserId)) {
            return res.status(400).json({ error: 'Invalid otherUserId' });
        }

        // Fetch messages where the user is either the sender or the receiver
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    // Current user is the sender, and otherUserId is the receiver
                    { [Op.and]: [{ sender_id: user_id }, { receiver_id: otherUserId }] },
                    // Current user is the receiver, and otherUserId is the sender
                    { [Op.and]: [{ sender_id: otherUserId }, { receiver_id: user_id }] }
                ],
            },
            order: [['SentAt', 'ASC']],
        });

        res.status(200).json({ data: messages });
    } catch (error) {
        console.error("Error fetching message history:", error);
        res.status(500).json({ error: 'An error occurred while fetching messages' });
    }
};


// Mark a message as read
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const user_id = req.user.id;  // Use 'UserID' from the token

        // Find the message and ensure the user is the receiver
        const message = await Message.findOne({
            where: { MessageID: messageId, receiver_id: user_id }
        });
        
        if (!message) return res.status(404).json({ error: 'Message not found or user not authorized' });

        // Update the message's is_read status
        message.is_read = true;
        await message.save();

        res.status(200).json({ message: 'Message marked as read', data: message });
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ error: 'An error occurred while updating the message' });
    }
};
//replay:
exports.replyToMessage = async (req, res) => {
    try {
        const sender_id = req.user.id;  // Extract sender ID from token
        const { messageId } = req.params;  // The original message being replied to
        const { message_text } = req.body;  // Destructure the reply message text from the request body

        // Find the original message being replied to
        const originalMessage = await Message.findOne({ where: { MessageID: messageId } });

        if (!originalMessage) {
            return res.status(404).json({ error: 'Original message not found' });
        }

        // Set receiver_id as the sender of the original message
        const receiver_id = originalMessage.sender_id;

        // Create the reply message
        const replyMessage = await Message.create({
            sender_id: sender_id,  // Sender is the user making the reply
            receiver_id: receiver_id,  // Automatically set as the original message's sender
            message_text: message_text,  // The text of the reply
            reply_to: originalMessage.MessageID,  // Reference to the original message

        });

        res.status(201).json({
            message: 'Reply sent successfully',
            data: replyMessage
        });
    } catch (error) {
        console.error('Error sending reply:', error);
        res.status(500).json({ error: 'An error occurred while sending the reply' });
    }
};
