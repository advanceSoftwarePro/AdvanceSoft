// A simple notification service to handle email notifications
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config();

exports.sendEmail = (userEmail, message) => {
    // Create a transporter object using the SMTP settings from environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER, // Use the SMTP_USER from your .env file
            pass: process.env.SMTP_PASS,   // Use the SMTP_PASS from your .env file
        },
        tls: {
            rejectUnauthorized: false, // This allows self-signed certificates
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER, // Use the same SMTP_USER for the "from" field
        to: userEmail,
        subject: 'Rating Alert',
        text: message,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending notification:', error);
        } else {
            console.log('Notification sent:', info.response);
        }
    });
};
