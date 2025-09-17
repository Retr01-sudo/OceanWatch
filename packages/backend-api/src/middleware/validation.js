const { body } = require('express-validator');
const { SEVERITY_OPTIONS } = require('../constants/severity');

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['citizen', 'official'])
    .withMessage('Role must be either citizen or official')
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for report creation
 */
const validateReport = [
  body('event_type')
    .notEmpty()
    .withMessage('Event type is required')
    .isIn(['Tsunami', 'Storm Surge', 'High Waves', 'Swell Surge', 'Coastal Current', 'Coastal Flooding', 'Coastal Damage', 'Unusual Tide', 'Other'])
    .withMessage('Event type must be one of: Tsunami, Storm Surge, High Waves, Swell Surge, Coastal Current, Coastal Flooding, Coastal Damage, Unusual Tide, Other'),
  body('severity_level')
    .optional()
    .isIn(SEVERITY_OPTIONS)
    .withMessage(`Severity level must be one of: ${SEVERITY_OPTIONS.join(', ')}`),
  body('report_language')
    .optional()
    .isIn(['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'])
    .withMessage('Report language must be a valid language option'),
  body('brief_title')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Brief title must be less than 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('latitude')
    .isNumeric()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  body('longitude')
    .isNumeric()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  body('phone_number')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && value.trim() !== '') {
        // Basic phone number validation - allow various formats
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          throw new Error('Phone number must be a valid format');
        }
      }
      return true;
    }),
  body('address')
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters')
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateReport
};

