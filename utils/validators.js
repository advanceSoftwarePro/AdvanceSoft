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


