const Message = require('../models/message');

const { Op } = require('sequelize');

const User = require('../models/user'); 

exports.sendMessage = async (req, res) => {
    try {
        const sender_id = req.user.id;  
        const { receiver_email, message_text } = req.body;  
        const receiver = await User.findOne({ where: { Email: receiver_email } });
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        console.log("sender_id", sender_id);
        console.log("receiver.UserID", receiver.UserID);
        console.log("message_text", message_text);
        const message = await Message.create({
            sender_id: sender_id,            
            receiver_id: receiver.UserID,    
            message_text: message_text,      
        });

        res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.getMessageHistory = async (req, res) => {
    try {
        const user_id = req.user.id;  
        const otherUserId = parseInt(req.params.otherUserId, 10);  

        console.log("req.params:", req.params);  
        console.log("user_id", user_id);
        console.log("otherUserId", otherUserId);

        if (isNaN(otherUserId)) {
            return res.status(400).json({ error: 'Invalid otherUserId' });
        }

        
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { [Op.and]: [{ sender_id: user_id }, { receiver_id: otherUserId }] },
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

exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const user_id = req.user.id;  
        const message = await Message.findOne({
            where: { MessageID: messageId, receiver_id: user_id }
        });
        
        if (!message) return res.status(404).json({ error: 'Message not found or user not authorized' });
        message.is_read = true;
        await message.save();

        res.status(200).json({ message: 'Message marked as read', data: message });
    } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).json({ error: 'An error occurred while updating the message' });
    }
};

exports.replyToMessage = async (req, res) => {
    try {
        const sender_id = req.user.id;  
        const { messageId } = req.params;  
        const { message_text } = req.body;  
        const originalMessage = await Message.findOne({ where: { MessageID: messageId } });

        if (!originalMessage) {
            return res.status(404).json({ error: 'Original message not found' });
        }

        const receiver_id = originalMessage.sender_id;

        const replyMessage = await Message.create({
            sender_id: sender_id,  
            receiver_id: receiver_id,  
            message_text: message_text, 
            reply_to: originalMessage.MessageID,  

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



;

exports.sendMessageToAdmin = async (req, res) => {
    try {
        const sender_id = req.user.id; 
        const { message_text } = req.body; 
        const adminUser = await User.findOne({ where: { Role: 'Admin' } });
        if (!adminUser) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        console.log("sender_id:", sender_id);
        console.log("adminUser.UserID:", adminUser.UserID);
        console.log("message_text:", message_text);
        const message = await Message.create({
            sender_id: sender_id,          
            receiver_id: adminUser.UserID, 
            message_text: message_text,    
        });

        res.status(201).json({ message: 'Message sent to admin successfully', data: message });
    } catch (error) {
        console.error("Error sending message to admin:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};
