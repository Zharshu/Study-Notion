const profileService = require("../services/profile.service");
const { successResponse } = require("../../../shared/utils/responseHandler");

/**
 * Update Profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await profileService.updateProfile(userId, req.body);
    return successResponse(res, 200, "Profile updated successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Account
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await profileService.deleteAccount(userId);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All User Details
 */
exports.getAllUserDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await profileService.getAllUserDetails(userId);
    return successResponse(res, 200, "User Data fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Display Picture
 */
exports.updateDisplayPicture = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.files.displayPicture;
    const result = await profileService.updateDisplayPicture(userId, file);
    return successResponse(res, 200, "Image updated successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Enrolled Courses
 */
exports.getEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await profileService.getEnrolledCourses(userId);
    return successResponse(
      res,
      200,
      "Enrolled courses fetched successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Instructor Dashboard
 */
exports.instructorDashboard = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const result = await profileService.instructorDashboard(instructorId);
    return successResponse(res, 200, "Dashboard stats fetched successfully", {
      courses: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can delete account
 */
exports.canDeleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await profileService.canDeleteAccount(userId);
    return successResponse(res, 200, "Check completed", result);
  } catch (error) {
    next(error);
  }
};
