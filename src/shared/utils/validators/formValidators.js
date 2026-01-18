/**
 * Form Validation Utilities
 * Common validation functions for forms
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} true if valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} true if valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid, message, strength }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "Password is required", strength: 0 };
  }
  
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  strength = Object.values(checks).filter(Boolean).length;
  
  if (!checks.length) {
    return { isValid: false, message: "Password must be at least 8 characters", strength };
  }
  
  if (strength < 3) {
    return { 
      isValid: false, 
      message: "Password must contain uppercase, lowercase, and number", 
      strength 
    };
  }
  
  return { isValid: true, message: "Strong password", strength };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} true if valid
 */
export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate required field
 * @param {any} value - Value to check
 * @returns {boolean} true if not empty
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validate min/max length
 * @param {string} value - String to check
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} true if within range
 */
export const isLengthValid = (value, min = 0, max = Infinity) => {
  if (!value) return false;
  const length = value.trim().length;
  return length >= min && length <= max;
};

/**
 * Validate number range
 * @param {number} value - Number to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} true if within range
 */
export const isInRange = (value, min = -Infinity, max = Infinity) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};
