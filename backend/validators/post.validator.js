import { body } from 'express-validator';

export const createPostValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Lost', 'Found', 'Adoption']).withMessage('Category must be Lost, Found, or Adoption'),

  body('contactInfo')
    .optional()
    .isLength({ max: 200 }).withMessage('Contact info cannot exceed 200 characters'),
];

export const updatePostValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('category')
    .optional()
    .isIn(['Lost', 'Found', 'Adoption']).withMessage('Category must be Lost, Found, or Adoption'),
];