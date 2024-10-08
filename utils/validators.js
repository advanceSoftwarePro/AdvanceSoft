// utils/validators.js
const Joi = require('joi');
const { body, validationResult } = require('express-validator');
const path = require('path');

exports.validateRegister = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Owner', 'Renter', 'Both').required(),
    confirm: Joi.boolean().when('role', {
      is: 'Owner',
      then: Joi.required(),
      otherwise: Joi.forbidden() 
    })
  });

  return schema.validate(data);
};



exports.validateUserProfile = [
  body('FullName').notEmpty().withMessage('Full Name is required.'),
  
  body('Email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .notEmpty()
    .withMessage('Email is required.')
    .normalizeEmail(),
  
  body('PhoneNumber')
    .notEmpty()
    .withMessage('Phone number is required.')
    .isMobilePhone() 
    .withMessage('Please provide a valid phone number.'),
  
  body('profilePicture')
    .optional() 
    .isURL()
    .withMessage('Please provide a valid URL for the profile picture.'),

 
  body('gender')
    .isIn(['Male', 'Female'])
    .withMessage('Gender must be Male or Female'),
    
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth (YYYY-MM-DD).'),
  

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];



exports.validateImageFile = (req, res, next) => {
 
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif']; 

 
  if (!validExtensions.includes(fileExtension)) {
    return res.status(400).json({ message: 'Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed.' });
  }

  next(); 
};

exports.validateChangePassword = [
  body('oldPassword')
      .notEmpty()
      .withMessage('Old password is required')
      .isLength({ min: 6 })
      .withMessage('Old password must be at least 6 characters long'),
  body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('New password must contain at least one number')
      .matches(/[A-Z]/)
      .withMessage('New password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('New password must contain at least one lowercase letter'),
  body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm password is required')
      .custom((value, { req }) => {
          if (value !== req.body.newPassword) {
              throw new Error('Confirm password does not match with new password');
          }
          return true;
      }),
];


