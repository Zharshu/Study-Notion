const passwordService = require('../services/password.service');
const { successResponse } = require('../../../shared/utils/responseHandler');

/**
 * Reset Password Token Controller
 * Generate and send password reset token via email
 */
exports.resetPasswordToken = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await passwordService.resetPasswordToken(email);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password Controller
 * Reset password using token from email
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const result = await passwordService.resetPassword(req.body);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};