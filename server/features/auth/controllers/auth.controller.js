const authService = require("../services/auth.service");
const {
  successResponse,
  createdResponse,
} = require("../../../shared/utils/responseHandler");
const tokenUtils = require("../../../shared/utils/tokenUtils");

/**
 * Signup Controller
 * Register a new user
 */
exports.signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    return createdResponse(res, "User registered successfully", user);
  } catch (error) {
    next(error);
  }
};

/**
 * Login Controller
 * Authenticate user and return tokens
 */
exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    // Set refresh token as httpOnly cookie
    const cookieOptions = tokenUtils.getRefreshTokenCookieOptions();
    res.cookie("refreshToken", result.refreshToken, cookieOptions);

    // Also set access token in cookie for compatibility
    res.cookie("token", result.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === "production",
    });

    return successResponse(res, 200, "User Login Success", {
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send OTP Controller
 * Send OTP to user's email for verification
 */
exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.sendOTP(email);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password Controller
 * Allow logged-in user to change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await authService.changePassword(userId, req.body);
    return successResponse(res, 200, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token Controller
 * Generate new access token using refresh token
 */
exports.refreshAccessToken = async (req, res, next) => {
  try {
    console.log("DEBUG: Refresh Token Request Recieved");
    console.log("Cookies:", req.cookies);
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      console.log("DEBUG: No Refresh Token in Cookies");
    }

    const result = await authService.refreshAccessToken(refreshToken);
    console.log(
      "DEBUG: Refresh Success. New Token:",
      result.token?.substring(0, 10) + "...",
    );

    // If token rotation is enabled, set new refresh token
    if (result.refreshToken) {
      const cookieOptions = tokenUtils.getRefreshTokenCookieOptions();
      res.cookie("refreshToken", result.refreshToken, cookieOptions);
    }

    // Also set new access token in cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h (or match env)
      secure: process.env.NODE_ENV === "production",
    });

    return successResponse(res, 200, "Access token refreshed successfully", {
      token: result.token,
    });
  } catch (error) {
    console.error("DEBUG: Refresh Logic Failed:", error.message);
    next(error);
  }
};

/**
 * Logout Controller
 * Revoke refresh token and clear cookies
 */
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    await authService.logout(refreshToken);

    // Clear cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.COOKIE_SAMESITE || "lax",
      path: "/",
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.COOKIE_SAMESITE || "lax",
      path: "/",
    });

    return successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Logout All Devices Controller
 * Revoke all refresh tokens for user
 */
exports.logoutAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await authService.logoutAll(userId);

    // Clear cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.COOKIE_SAMESITE || "lax",
      path: "/",
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.COOKIE_SAMESITE || "lax",
      path: "/",
    });

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};
