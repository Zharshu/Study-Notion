const progressService = require('../services/progress.service');
const { successResponse } = require('../../../shared/utils/responseHandler');

/**
 * Update Course Progress Controller
 * Mark a subsection as completed
 */
exports.updateCourseProgress = async (req, res, next) => {
  try {
    const { courseId, subsectionId } = req.body;
    const userId = req.user.id;
    
    const result = await progressService.updateCourseProgress(courseId, subsectionId, userId);
    return successResponse(res, 200, result.message, {
      progressPercentage: result.progressPercentage,
      completedVideos: result.completedVideos,
      totalVideos: result.totalVideos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Course Progress Controller
 * Get progress details for a course
 */
exports.getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const result = await progressService.getCourseProgress(courseId, userId);
    return successResponse(res, 200, 'Course progress retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
