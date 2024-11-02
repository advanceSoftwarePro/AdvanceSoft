
const User = require('../models/user');
const authService = require('../services/authService');
const stripe = require('stripe')('sk_test_51Q67wNP2XFAQ7ru8gaqYklalVKL8ZlDYVpZYc0C2RVMESwBOxrP1RE1Z8NNvp5OYV4UnKmgouaQfASf5gDWfuX2c009N4rwRHI'); // Replace with your Stripe secret key
const { validateRegister } = require('../utils/validators');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const TokenBlacklist = require('../models/tokenBlacklist');

exports.register = async (req, res) => {
  const { fullName, email, password, role } = req.body;

 
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
   
    const existingUser = await User.findOne({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await authService.hashPassword(password);

    const userData = {
      FullName: fullName,
      Email: email,
      Password: hashedPassword,
      Role: role,
      VerificationStatus: 'Unverified', 
    };

   
    const verificationToken = authService.generateVerificationToken(email);

   
    await authService.sendVerificationEmail(email, verificationToken);

    return res.status(200).json({
      message: 'Registration successful. Please verify your email.',
      verificationToken: verificationToken, 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.verifyEmail = async (req, res) => {
  const { token } = req.params; // Assuming you pass the token in the URL

  try {
    const email = await authService.verifyToken(token); // Verify the token and retrieve the email

    // Check if the email is already registered (to avoid duplicate verification)
    const existingUser = await User.findOne({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered or verified' });
    }

    // If the user is not already registered, store their data in the database
    const userData = {
      FullName: req.body.fullName, // Get fullName from the request body
      Email: email,
      Password: await authService.hashPassword(req.body.password), // Hash the password from request body
      Role: req.body.role, // Get role from request body
      VerificationStatus: 'Verified', // Mark as verified
    };

    // Create the user in the database after verification
    const user = await User.create(userData);

    return res.status(200).json({ message: 'Email verified and user registered successfully.' });

  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};



exports.registerOwner = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (role !== 'Owner') {
    return res.status(400).json({ message: 'Only owners can register here.' });
  }
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
   
  
  try {
    const existingUser = await User.findOne({ where: { Email: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Hash the password (optional, you can store it later)
    const hashedPassword = await authService.hashPassword(password);

    // Generate a verification token
    const verificationToken = authService.generateVerificationToken(email);

    // Generate payment intent (fees for using the app as an owner)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // Amount in cents ($10.00)
      currency: 'usd',
      payment_method_types: ['card'],
    });

    // Send the verification email to the owner
    await authService.sendVerificationEmail(email, verificationToken);

    // Return the payment intent secret and verification token in the response
    return res.status(200).json({
      message: 'Owner registration started. Please verify your email and complete the payment.',
      paymentIntentSecret: paymentIntent.client_secret,
      verificationToken: verificationToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};



exports.verifyOwnerEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token and get the email associated with it
    const email = await authService.verifyToken(token);

    // Send a response asking for payment to complete the registration
    return res.status(200).json({
      message: 'Email verified. Please complete the payment to finish your registration.',
      email: email,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};



exports.confirmOwnerPayment = async (req, res) => {
  const { paymentIntentId, email, fullName, password } = req.body;

  try {
    // Confirm the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed. Please try again.' });
    }

    // Now that the payment is successful, register the user in the database
    const hashedPassword = await authService.hashPassword(password);

    const userData = {
      FullName: fullName,
      Email: email,
      Password: hashedPassword,
      Role: 'Owner',
      VerificationStatus: 'Verified',
      paymentIntent:paymentIntentId
    };

    // Save the user in the database
    const newUser = await User.create(userData);

    return res.status(201).json({ message: 'Registration complete. Welcome to the platform!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
  
    const user = await User.findOne({ where: { Email: email } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    if (user.AccountStatus === 'Deactivated') {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
  }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }


    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, role: user.Role },
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        fullName: user.FullName,
        email: user.Email,
        role: user.Role,
      },
    });
  } catch (err) {
    console.error('Login error:', err); 
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { Email: email } });

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

  
    const resetToken = authService.generateResetToken(email);

    
    await authService.sendResetPasswordEmail(email, resetToken);

    return res.status(200).json({ message: 'Password reset email sent. Check your inbox.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    
    const email = await authService.verifyToken(token);

    const user = await User.findOne({ where: { Email: email } });

    if (!user) {
      return res.status(404).json({ message: 'Invalid token or user not found' });
    }

    
    const hashedPassword = await authService.hashPassword(newPassword);

    
    user.Password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
};
 

exports.logout = async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; 


  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.userId; 

    
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); 

      await TokenBlacklist.create({
        token,
        userId,
        expiresAt,
      });

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error blacklisting token:', error);
      return res.status(500).json({ message: 'Error logging out' });
    }
  });
};