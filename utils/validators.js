// utils/validators.js
const Joi = require('joi');

exports.validateRegister = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Owner', 'Renter', 'Both').required(),
    confirm: Joi.boolean().when('role', {
      is: 'Owner',
      then: Joi.required(),
      otherwise: Joi.forbidden() // 'confirm' is not allowed for other roles
    })
  });

  return schema.validate(data);
};
