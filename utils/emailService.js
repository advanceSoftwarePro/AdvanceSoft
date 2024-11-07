

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587, 
  secure: process.env.SMTP_PORT == 465, 
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

exports.sendEmail = async (to, subject, text, html) => {
  try {
    console.log('Sending email to:', to); 
  console.log('Subject:', subject);
  console.log('Text:', text);
  console.log('HTML:', html);
  
    const info = await transporter.sendMail({
      from: '"Rental Platform" <no-reply@rentalplatform.com>', 
      to: to, 
      subject: subject, 
      text: text, 
      html: html, 
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};