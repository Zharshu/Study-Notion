const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

/**
 * Generate access token with short expiration (15 minutes)
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT access token
 */
exports.generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

/**
 * Generate refresh token with long expiration (30 days)
 * @param {Object} payload - User data to encode in token
 * @returns {String} JWT refresh token
 */
exports.generateRefreshToken = (payload) => {
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
  return jwt.sign(
    payload,
    refreshSecret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d" }
  );
};

/**
 * Verify access token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
exports.verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
exports.verifyRefreshToken = (token) => {
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
  return jwt.verify(token, refreshSecret);
};

/**
 * Hash the refresh token before storing in database
 * @param {String} token - Plain refresh token
 * @returns {String} Hashed token
 */
exports.hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generate cookie options for refresh token
 * @returns {Object} Cookie options
 */
exports.getRefreshTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = process.env.COOKIE_SAMESITE || "lax";
  
  // Browsers require Secure=true when SameSite=None
  const secure = isProduction || sameSite.toLowerCase() === 'none';
  
  return {
    httpOnly: true, // Prevents JavaScript access
    secure: secure, // Enforce HTTPS if SameSite is None or in production
    sameSite: sameSite, // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    path: "/", // Available across entire app
    ...(isProduction && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
};

/**
 * Calculate token expiry time
 * @param {String} expiresIn - Time string (e.g., "15m", "30d")
 * @returns {Date} Expiry date
 */
exports.calculateExpiryDate = (expiresIn) => {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error("Invalid expiry format");
  }

  const [, amount, unit] = match;
  return new Date(Date.now() + amount * units[unit]);
};

/**
 * Extract device information from request
 * @param {Object} req - Express request object
 * @returns {Object} Device info
 */
exports.extractDeviceInfo = (req) => {
  const userAgent = req.get("user-agent") || "";
  
  let deviceType = "desktop";
  if (/mobile/i.test(userAgent)) {
    deviceType = "mobile";
  } else if (/tablet|ipad/i.test(userAgent)) {
    deviceType = "tablet";
  }

  return {
    userAgent: userAgent.substring(0, 200), // Limit length
    ip: req.ip || req.connection.remoteAddress,
    deviceType,
  };
};
