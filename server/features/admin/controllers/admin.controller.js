const adminService = require("../services/admin.service");
const { successResponse } = require("../../../shared/utils/responseHandler");

/**
 * Get All Users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    return successResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    next(error);
  }
};

/**
 * Get User By ID
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await adminService.getUserById(userId);
    return successResponse(
      res,
      200,
      "User details retrieved successfully",
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend User
 */
exports.suspendUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const result = await adminService.toggleUserSuspension(
      userId,
      reason,
      true
    );
    return successResponse(res, 200, result.message, result.user);
  } catch (error) {
    next(error);
  }
};

/**
 * Unsuspend User
 */
exports.unsuspendUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await adminService.toggleUserSuspension(userId, null, false);
    return successResponse(res, 200, result.message, result.user);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await adminService.deleteUser(userId);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Pending Courses
 */
exports.getPendingCourses = async (req, res, next) => {
  try {
    const courses = await adminService.getPendingCourses();
    return successResponse(
      res,
      200,
      "Pending courses retrieved successfully",
      courses
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Approve/Reject Course
 */
exports.updateCourseApproval = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status, reason } = req.body;
    const result = await adminService.updateCourseApproval(
      courseId,
      status,
      reason
    );
    return successResponse(res, 200, result.message, result.course);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Platform Stats
 */
exports.getPlatformStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPlatformStats();
    return successResponse(
      res,
      200,
      "Platform statistics retrieved successfully",
      stats
    );
  } catch (error) {
    next(error);
  }
};
/**
 * Toggle Featured Course
 */
exports.toggleFeaturedCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await adminService.toggleFeaturedCourse(courseId);
    return successResponse(res, 200, "Course featured status updated", course);
  } catch (error) {
    next(error);
  }
};
