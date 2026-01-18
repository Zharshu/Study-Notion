const { User } = require('../../../shared/models');
const { ValidationError, AuthenticationError, NotFoundError } = require('../../../shared/errors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mailSender = require('../../../shared/utils/email/emailSender');
const { passwordUpdated } = require('../../../shared/utils/email/templates/passwordUpdate');

/**
 * Generate password reset token
 * @param {string} email - User email
 * @returns {Object} Message and reset URL
 * @throws {NotFoundError} If user not found
 */
exports.resetPasswordToken = async (email) => {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  // Find user
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new NotFoundError(`This Email: ${email} is not registered with us. Enter a valid email`);
  }

  // Generate reset token
  const token = crypto.randomBytes(20).toString('hex');

  // Update user with token and expiry
  await User.findOneAndUpdate(
    { email },
    {
      token,
      resetPasswordExpires: Date.now() + 3600000 // 1 hour
    },
    { new: true }
  );

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/update-password/${token}`;

  // Send email
  await mailSender(
    email,
    'Password Reset Request',
    `Your link for password reset is ${resetUrl}. Please click this URL to reset your password. This link is valid for 1 hour.`
  );

  return {
    message: 'Email sent successfully. Please check your email to continue',
    resetUrl // For development/testing purposes
  };
};

/**
 * Reset password using token
 * @param {Object} resetData - { password, confirmPassword, token }
 * @returns {Object} Success message
 * @throws {ValidationError} If passwords don't match
 * @throws {NotFoundError} If token invalid
 * @throws {AuthenticationError} If token expired
 */
exports.resetPassword = async ({ password, confirmPassword, token }) => {
  // Validate input
  if (!password || !confirmPassword || !token) {
    throw new ValidationError('All fields are required');
  }

  // Check passwords match
  if (password !== confirmPassword) {
    throw new ValidationError('Password and Confirm Password do not match');
  }

  // Find user by token
  const user = await User.findOne({ token });
  
  if (!user) {
    throw new NotFoundError('Token is invalid');
  }

  // Check token expiry
  if (!(user.resetPasswordExpires > Date.now())) {
    throw new AuthenticationError('Token is expired. Please regenerate your token');
  }

  // Hash new password
  const encryptedPassword = await bcrypt.hash(password, 10);

  // Update password and clear token
  await User.findOneAndUpdate(
    { token },
    {
      password: encryptedPassword,
      token: null,
      resetPasswordExpires: null
    },
    { new: true }
  );

  // Send confirmation email
  try {
    await mailSender(
      user.email,
      'Password Reset Successful',
      passwordUpdated(
        user.email,
        `Password updated successfully for ${user.firstName} ${user.lastName}`
      )
    );
  } catch (emailError) {
    console.error('Error sending password reset confirmation email:', emailError);
    // Don't fail the request if email fails
  }

  return {
    message: 'Password Reset Successful'
  };
};

/**
 * Change password (when user is logged in)
 * @param {string} userId - User ID from auth middleware
 * @param {Object} passwords - { oldPassword, newPassword }
 * @returns {Object} Success message
 * @throws {AuthenticationError} If old password incorrect
 */
exports.changePassword = async (userId, { oldPassword, newPassword }) => {
  // Validate input
  if (!oldPassword || !newPassword) {
    throw new ValidationError('Old password and new password are required');
  }

  // Get user
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Validate old password
  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  
  if (!isPasswordMatch) {
    throw new AuthenticationError('The password is incorrect');
  }

  // Prevent same password
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new ValidationError('New password cannot be the same as old password');
  }

  // Hash new password
  const encryptedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  user.password = encryptedPassword;
  await user.save();

  // Send notification email
  try {
    await mailSender(
      user.email,
      'Password Changed Successfully',
      passwordUpdated(
        user.email,
        `Password updated successfully for ${user.firstName} ${user.lastName}`
      )
    );
  } catch (emailError) {
    console.error('Error sending password change notification:', emailError);
    // Don't fail the request if email fails
  }

  return {
    message: 'Password updated successfully',
    email: user.email
  };
};
