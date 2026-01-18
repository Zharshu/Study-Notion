const { body } = require('express-validator');

exports.signupValidator = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    
  body('accountType')
    .optional()
    .isIn(['Student', 'Instructor'])
    .withMessage('Invalid account type'),
    
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
];

exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

exports.changePasswordValidator = [
  body('oldPassword')
    .trim()
    .notEmpty()
    .withMessage('Old password is required'),
    
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
/*     .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('New password cannot be same as old password');
      }
      return true;
    }) */
];

exports.resetPasswordValidator = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Token is missing')
];
