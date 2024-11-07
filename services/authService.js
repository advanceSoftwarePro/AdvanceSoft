
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const crypto = require('crypto');
const User = require('../models/User');

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} - The hashed password.
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10); 
};

/**
 * Generates a JSON Web Token for email verification.
 * @param {string} email - The email to include in the token payload.
 * @returns {string} - The verification token.
 */
exports.generateVerificationToken = (email) => {
  const payload = { email }; 
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }); 
};

/**
 * Verifies a given token and returns the decoded payload.
 * @param {string} token - The token to verify.
 * @returns {Promise<string>} - The decoded email from the token.
 */
exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded.email); 
    });
  });
};

/**
 * Sends a verification email to the user.
 * @param {string} email - The recipient's email address.
 * @param {string} token - The token to include in the verification link.
 */
exports.sendVerificationEmail = async (email, token) => {
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, 
    },
  });

  const url = `http://localhost:3000/auth/verify/${token}`; 
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`, 
  };

  
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};



exports.generateResetToken = (email) => {
  const payload = { email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); 
};

exports.sendResetPasswordEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetUrl = `http://localhost:3000/auth/reset-password/${token}`;
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link is valid for 1 hour.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw new Error('Failed to send reset password email');
  }
};



