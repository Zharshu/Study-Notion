const { body } = require('express-validator');

exports.categoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
];

exports.suspendUserValidator = [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Suspension reason is required')
    .isLength({ min: 10 })
    .withMessage('Reason must be at least 10 characters')
];

exports.approveCourseValidator = [
  body('status')
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be Approved or Rejected')
];
