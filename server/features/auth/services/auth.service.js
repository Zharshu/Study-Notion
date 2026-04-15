const { User, OTP, Profile, RefreshToken } = require('../../../shared/models');
const { AuthenticationError, ValidationError } = require('../../../shared/errors');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');
const tokenUtils = require('../../../shared/utils/tokenUtils');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * User signup service
 * @param {Object} userData - User registration data
 * @returns {Object} Created user object
 * @throws {ValidationError} If validation fails
 */
exports.signup = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    accountType,
    contactNumber,
    otp
  } = userData;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
    throw new ValidationError('All fields are required');
  }

  // Check password match
  if (password !== confirmPassword) {
    throw new ValidationError('Password and Confirm Password do not match');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('User already exists. Please sign in');
  }

  // Verify OTP
  const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
  
  if (recentOtp.length === 0 || otp !== recentOtp[0].otp) {
    throw new ValidationError('The OTP is not valid');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create profile
  const profileDetails = await Profile.create({
    gender: null,
    dateOfBirth: null,
    about: null,
    contactNumber: contactNumber || null
  });

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    contactNumber,
    password: hashedPassword,
    accountType: accountType || 'Student',
    approved: accountType === 'Instructor' ? false : true,
    additionalDetails: profileDetails._id,
    image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
  });

  // Return user without password
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    accountType: user.accountType,
    approved: user.approved
  };
};

/**
 * User login service
 * @param {Object} credentials - { email, password }
 * @returns {Object} { user, token, refreshToken }
 * @throws {ValidationError} If required fields missing
 * @throws {AuthenticationError} If credentials invalid
 */
exports.login = async ({ email, password }) => {
  // Validate input
  if (!email || !password) {
    throw new ValidationError('Please fill up all the required fields');
  }

  // Find user with populated profile
  const user = await User.findOne({ email }).populate('additionalDetails');

  if (!user) {
    throw new AuthenticationError('User is not registered with us. Please sign up to continue');
  }

  // Check if user is suspended
  if (user.suspended) {
    const message = user.suspensionReason 
      ? `Your account has been suspended. Reason: ${user.suspensionReason}`
      : 'Your account has been suspended. Please contact admin for details';
    throw new AuthenticationError(message);
  }

  // Verify password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  
  if (!isPasswordMatch) {
    throw new AuthenticationError('Password is incorrect');
  }

  // Prepare token payload
  const tokenPayload = {
    email: user.email,
    id: user._id,
    accountType: user.accountType
  };

  // Generate access token (15 minutes)
  const token = tokenUtils.generateAccessToken(tokenPayload);

  // Generate refresh token (30 days)
  const refreshTokenValue = tokenUtils.generateRefreshToken(tokenPayload);

  // Hash refresh token before storing
  const hashedRefreshToken = tokenUtils.hashToken(refreshTokenValue);

  // Extract device info and calculate expiry
  const expiryDate = tokenUtils.calculateExpiryDate(
    process.env.REFRESH_TOKEN_EXPIRY || '30d'
  );

  // Store refresh token in database
  await RefreshToken.create({
    userId: user._id,
    token: hashedRefreshToken,
    expiresAt: expiryDate,
    deviceInfo: {}, // Can be enhanced with actual device info
    isRevoked: false
  });

  // Update last login time
  user.lastLogin = new Date();
  user.loginAttempts = 0;
  await user.save();

  // Return user data and tokens
  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountType: user.accountType,
      image: user.image,
      additionalDetails: user.additionalDetails
    },
    token,
    refreshToken: refreshTokenValue
  };
};

/**
 * Send OTP for email verification
 * @param {string} email - User email
 * @returns {Object} Success message
 * @throws {ValidationError} If email missing or user exists
 */
exports.sendOTP = async (email) => {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  // Check if user already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('User already registered. Please login instead');
  }

  // Generate OTP
  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });

  // Ensure unique OTP
  let existingOTP = await OTP.findOne({ otp });
  while (existingOTP) {
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });
    existingOTP = await OTP.findOne({ otp });
  }

  // Save OTP to database (pre-save hook will send email)
  await OTP.create({ email, otp });

  return {
    message: `OTP sent successfully to ${email}`,
    email
  };
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {Object} passwords - { oldPassword, newPassword }
 * @returns {Object} Success message
 * @throws {AuthenticationError} If old password incorrect
 */
exports.changePassword = async (userId, { oldPassword, newPassword }) => {
  // Get user
  const user = await User.findById(userId);

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Validate old password
  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  
  if (!isPasswordMatch) {
    throw new AuthenticationError('The password is incorrect');
  }

  // Hash new password
  const encryptedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  user.password = encryptedPassword;
  await user.save();

  return {
    email: user.email,
    name: `${user.firstName} ${user.lastName}`
  };
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token from cookies
 * @returns {Object} { token, newRefreshToken? }
 * @throws {AuthenticationError} If token invalid
 */
exports.refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token not found');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = tokenUtils.verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  // Hash token to find in database
  const hashedToken = tokenUtils.hashToken(refreshToken);

  // Find refresh token in database
  const storedToken = await RefreshToken.findOne({
    token: hashedToken,
    userId: decoded.id
  });

  if (!storedToken) {
    throw new AuthenticationError('Refresh token not found in database');
  }

  // Check if token is valid
  if (!storedToken.isValid()) {
    throw new AuthenticationError('Refresh token is revoked or expired');
  }

  // Update last used time
  storedToken.lastUsedAt = new Date();
  await storedToken.save();

  // Generate new access token
  const tokenPayload = {
    email: decoded.email,
    id: decoded.id,
    accountType: decoded.accountType
  };

  const newAccessToken = tokenUtils.generateAccessToken(tokenPayload);

  // Optional: Token rotation for better security
  let newRefreshToken = null;
  if (process.env.ENABLE_TOKEN_ROTATION === 'true') {
    newRefreshToken = tokenUtils.generateRefreshToken(tokenPayload);
    const hashedNewToken = tokenUtils.hashToken(newRefreshToken);

    // Revoke old token
    storedToken.isRevoked = true;
    await storedToken.save();

    // Create new refresh token
    const expiryDate = tokenUtils.calculateExpiryDate(
      process.env.REFRESH_TOKEN_EXPIRY || '30d'
    );

    await RefreshToken.create({
      userId: decoded.id,
      token: hashedNewToken,
      expiresAt: expiryDate,
      deviceInfo: {},
      isRevoked: false
    });
  }

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken
  };
};

/**
 * Logout user
 * @param {string} refreshToken - Refresh token from cookies
 * @returns {Object} Success message
 */
exports.logout = async (refreshToken) => {
  if (refreshToken) {
    // Hash and find the refresh token
    const hashedToken = tokenUtils.hashToken(refreshToken);

    // Revoke the refresh token
    await RefreshToken.updateOne(
      { token: hashedToken },
      { $set: { isRevoked: true } }
    );
  }

  return { message: 'Logged out successfully' };
};

/**
 * Logout from all devices
 * @param {string} userId - User ID
 * @returns {Object} Success message with count
 */
exports.logoutAll = async (userId) => {
  // Revoke all refresh tokens for the user
  const result = await RefreshToken.revokeAllForUser(userId);

  return {
    message: `Logged out from ${result} devices successfully`,
    count: result
  };
};

/**
 * Custom Google OAuth handler
 * @param {string} token - Google ID Token
 * @param {string} accountType - Selected account type for new signups
 * @returns {Object} { user, token, refreshToken }
 */
exports.googleAuth = async (token, accountType) => {
  if (!token) {
    throw new ValidationError('Google ID Token is required');
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    throw new AuthenticationError('Invalid Google authentication token');
  }

  const payload = ticket.getPayload();
  const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

  let user = await User.findOne({ email }).populate('additionalDetails');

  if (user) {
    if (user.suspended) {
      const message = user.suspensionReason 
        ? `Your account has been suspended. Reason: ${user.suspensionReason}`
        : 'Your account has been suspended. Please contact admin for details';
      throw new AuthenticationError(message);
    }
    
    // Optionally update user to link google account if not linked
    if (user.authProvider === 'local' && !user.googleId) {
      user.googleId = googleId;
      user.authProvider = 'google';
      user.image = user.image || picture;
      await user.save();
    }
  } else {
    // Create new google user
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null
    });

    user = await User.create({
      firstName: firstName || 'Google',
      lastName: lastName || 'User',
      email,
      accountType: accountType || 'Student',
      approved: accountType === 'Instructor' ? false : true,
      additionalDetails: profileDetails._id,
      image: picture || `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      authProvider: 'google',
      googleId,
    });
  }

  // Standard token generation process matching login()
  const tokenPayload = {
    email: user.email,
    id: user._id,
    accountType: user.accountType
  };

  const accessToken = tokenUtils.generateAccessToken(tokenPayload);
  const refreshTokenValue = tokenUtils.generateRefreshToken(tokenPayload);
  const hashedRefreshToken = tokenUtils.hashToken(refreshTokenValue);
  const expiryDate = tokenUtils.calculateExpiryDate(process.env.REFRESH_TOKEN_EXPIRY || '30d');

  await RefreshToken.create({
    userId: user._id,
    token: hashedRefreshToken,
    expiresAt: expiryDate,
    deviceInfo: {}, 
    isRevoked: false
  });

  user.lastLogin = new Date();
  user.loginAttempts = 0;
  await user.save();

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountType: user.accountType,
      image: user.image,
      additionalDetails: user.additionalDetails
    },
    token: accessToken,
    refreshToken: refreshTokenValue
  };
};

