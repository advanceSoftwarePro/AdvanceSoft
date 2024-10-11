const nodemailer = require('nodemailer');

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587, // Default to port 587 if not set
  secure: process.env.SMTP_PORT == 465, // true for port 465 (SSL), false for other ports (e.g., 587)
  auth: {
    user: process.env.SMTP_USER, // SMTP username from environment
    pass: process.env.SMTP_PASS, // SMTP password from environment
  },
  tls: {
    rejectUnauthorized: false, // Skip SSL verification for self-signed certificates (useful in development)
  },
});

// Send email function
exports.sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Rental Platform" <no-reply@rentalplatform.com>', // Sender address
      to: to, // Receiver's email
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error.message);
    // Optionally, add more detailed logging or handle retry logic here
  }
};
