const nodemailer = require('nodemailer');


require('dotenv').config();

exports.sendEmail = (userEmail, message) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER, 
            pass: process.env.SMTP_PASS,   
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER, 
        to: userEmail,
        subject: 'Rating Alert',
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending notification:', error);
        } else {
            console.log('Notification sent:', info.response);
        }
    });
};
