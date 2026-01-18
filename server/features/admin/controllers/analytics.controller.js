const analyticsService = require("../services/analytics.service");
const { successResponse } = require("../../../shared/utils/responseHandler");

/**
 * Get Instructor Analytics
 */
exports.getInstructorAnalytics = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const analytics = await analyticsService.getInstructorAnalytics(
      instructorId
    );
    return successResponse(
      res,
      200,
      "Instructor analytics retrieved successfully",
      analytics
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Platform Analytics (Admin)
 */
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await analyticsService.getPlatformAnalytics(
      startDate,
      endDate
    );
    return successResponse(
      res,
      200,
      "Platform analytics retrieved successfully",
      analytics
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Enrollment Trends
 */
exports.getEnrollmentTrends = async (req, res, next) => {
  try {
    const { months } = req.query;
    const trends = await analyticsService.getEnrollmentTrends(
      months ? parseInt(months) : 6
    );
    return successResponse(
      res,
      200,
      "Enrollment trends retrieved successfully",
      trends
    );
  } catch (error) {
    next(error);
  }
};
