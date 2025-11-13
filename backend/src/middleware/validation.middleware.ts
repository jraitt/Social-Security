/**
 * Validation Middleware
 * 
 * Provides request validation using express-validator for API endpoints.
 * Ensures all inputs are properly validated and sanitized before processing.
 */

import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation rules for individual calculation endpoint
 */
export const validateIndividualCalculation = [
  body('birthDate')
    .notEmpty()
    .withMessage('Birth date is required')
    .isISO8601()
    .withMessage('Birth date must be in ISO 8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const currentYear = new Date().getFullYear();
      const birthYear = birthDate.getFullYear();
      const age = currentYear - birthYear;
      
      if (age < 50 || age > 70) {
        throw new Error('Age must be between 50 and 70 years');
      }
      return true;
    }),

  body('pia')
    .notEmpty()
    .withMessage('PIA (Primary Insurance Amount) is required')
    .isFloat({ min: 1, max: 5000 })
    .withMessage('PIA must be between $1 and $5,000 per month'),

  body('lifeExpectancy')
    .notEmpty()
    .withMessage('Life expectancy is required')
    .isInt({ min: 70, max: 100 })
    .withMessage('Life expectancy must be between 70 and 100 years')
    .custom((value, { req }) => {
      if (req.body.birthDate) {
        const birthDate = new Date(req.body.birthDate);
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const currentAge = currentYear - birthYear;
        
        if (value <= currentAge) {
          throw new Error('Life expectancy must be greater than current age');
        }
        
        if (value < 62) {
          throw new Error('Life expectancy must be at least 62 to claim Social Security benefits');
        }
      }
      return true;
    }),

  body('inflationRate')
    .notEmpty()
    .withMessage('Inflation rate is required')
    .isFloat({ min: 0, max: 0.10 })
    .withMessage('Inflation rate must be between 0% and 10% (0 to 0.10)'),
];

/**
 * Validation rules for person data (used in couple calculations)
 */
const personValidationRules = (prefix: string) => [
  body(`${prefix}.birthDate`)
    .notEmpty()
    .withMessage(`${prefix} birth date is required`)
    .isISO8601()
    .withMessage(`${prefix} birth date must be in ISO 8601 format (YYYY-MM-DD)`)
    .custom((value) => {
      const birthDate = new Date(value);
      const currentYear = new Date().getFullYear();
      const birthYear = birthDate.getFullYear();
      const age = currentYear - birthYear;
      
      if (age < 50 || age > 70) {
        throw new Error(`${prefix} age must be between 50 and 70 years`);
      }
      return true;
    }),

  body(`${prefix}.pia`)
    .notEmpty()
    .withMessage(`${prefix} PIA (Primary Insurance Amount) is required`)
    .isFloat({ min: 1, max: 5000 })
    .withMessage(`${prefix} PIA must be between $1 and $5,000 per month`),

  body(`${prefix}.lifeExpectancy`)
    .notEmpty()
    .withMessage(`${prefix} life expectancy is required`)
    .isInt({ min: 70, max: 100 })
    .withMessage(`${prefix} life expectancy must be between 70 and 100 years`)
    .custom((value, { req }) => {
      const personData = req.body[prefix];
      if (personData && personData.birthDate) {
        const birthDate = new Date(personData.birthDate);
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const currentAge = currentYear - birthYear;
        
        if (value <= currentAge) {
          throw new Error(`${prefix} life expectancy must be greater than current age`);
        }
        
        if (value < 62) {
          throw new Error(`${prefix} life expectancy must be at least 62 to claim Social Security benefits`);
        }
      }
      return true;
    }),
];

/**
 * Validation rules for couple calculation endpoint
 */
export const validateCoupleCalculation = [
  ...personValidationRules('spouse1'),
  ...personValidationRules('spouse2'),

  body('inflationRate')
    .notEmpty()
    .withMessage('Inflation rate is required')
    .isFloat({ min: 0, max: 0.10 })
    .withMessage('Inflation rate must be between 0% and 10% (0 to 0.10)'),
];

/**
 * Validation rules for enhanced individual calculation endpoint
 * Extends basic validation with optional discount rate parameter
 */
export const validateEnhancedIndividualCalculation = [
  ...validateIndividualCalculation,
  
  body('discountRate')
    .optional()
    .isFloat({ min: 0, max: 0.10 })
    .withMessage('Discount rate must be between 0% and 10% (0 to 0.10)'),
];

/**
 * Validation rules for enhanced couple calculation endpoint
 * Extends basic validation with optional discount rate parameter
 */
export const validateEnhancedCoupleCalculation = [
  ...validateCoupleCalculation,
  
  body('discountRate')
    .optional()
    .isFloat({ min: 0, max: 0.10 })
    .withMessage('Discount rate must be between 0% and 10% (0 to 0.10)'),
];

/**
 * Middleware to handle validation errors
 * 
 * Checks for validation errors and returns a 400 response with error details
 * if any validation rules failed.
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors.array().map(err => ({
          field: err.type === 'field' ? err.path : undefined,
          message: err.msg,
        })),
      },
    });
    return;
  }
  
  next();
};
