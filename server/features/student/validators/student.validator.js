const { body } = require('express-validator');

exports.paymentValidator = [
  body('courses')
    .isArray({ min: 1 })
    .withMessage('At least one course is required'),
];

exports.verifyPaymentValidator = [
  body('razorpay_order_id')
    .trim()
    .notEmpty()
    .withMessage('Razorpay Order ID is required'),
    
  body('razorpay_payment_id')
    .trim()
    .notEmpty()
    .withMessage('Razorpay Payment ID is required'),
    
  body('razorpay_signature')
    .trim()
    .notEmpty()
    .withMessage('Razorpay Signature is required'),
    
  body('courses')
    .isArray({ min: 1 })
    .withMessage('Courses array required')
];

exports.reviewValidator = [
  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required'),
    
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
    
  body('review')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
];

exports.progressValidator = [
  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required'),
    
  body('subsectionId')
    .trim()
    .notEmpty()
    .withMessage('Subsection ID is required')
];
