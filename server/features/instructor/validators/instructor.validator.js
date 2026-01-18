const { body } = require('express-validator');

exports.courseValidator = [
  body('courseName')
    .trim()
    .notEmpty()
    .withMessage('Course name is required'),
    
  body('courseDescription')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
    
  body('whatYouWillLearn')
    .trim()
    .notEmpty()
    .withMessage('Learning objectives required'),
    
  body('price')
    .isNumeric()
    .withMessage('Price must be a number'),
    
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
];

exports.sectionValidator = [
  body('sectionName')
    .trim()
    .notEmpty()
    .withMessage('Section name is required'),
    
  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
];

exports.subsectionValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
    
  body('sectionId')
    .trim()
    .notEmpty()
    .withMessage('Section ID is required')
];
