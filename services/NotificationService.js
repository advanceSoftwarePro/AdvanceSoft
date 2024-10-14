// A simple notification service to handle email notifications
const nodemailer = require('nodemailer');

exports.sendNotification = (userEmail, message) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: userEmail,
        subject: 'Rating Alert',
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending notification:', error);
        } else {
            console.log('Notification sent:', info.response);
        }
    });
};
