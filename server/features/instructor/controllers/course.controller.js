const courseService = require("../services/course.service");
const {
  successResponse,
  createdResponse,
} = require("../../../shared/utils/responseHandler");

/**
 * Create Course Controller
 */
exports.createCourse = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const thumbnailFile = req.files?.thumbnailImage;

    const course = await courseService.createCourse(
      req.body,
      instructorId,
      thumbnailFile
    );
    return createdResponse(res, "Course created successfully", course);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Instructor Courses Controller
 */
exports.getInstructorCourses = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const courses = await courseService.getInstructorCourses(instructorId);
    return successResponse(res, 200, "Courses retrieved successfully", courses);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Course Details Controller
 */
exports.getCourseDetails = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.getCourseDetails(courseId);
    return successResponse(
      res,
      200,
      "Course details retrieved successfully",
      course
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update Course Controller
 */
exports.updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;
    const thumbnailFile = req.files?.thumbnailImage;

    const course = await courseService.updateCourse(
      courseId,
      req.body,
      instructorId,
      thumbnailFile
    );
    return successResponse(res, 200, "Course updated successfully", course);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Course Controller
 */
exports.deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;

    const result = await courseService.deleteCourse(courseId, instructorId);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Courses Controller (Public)
 */
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getAllCourses();
    return successResponse(
      res,
      200,
      "All courses retrieved successfully",
      courses
    );
  } catch (error) {
    next(error);
  }
};
/**
 * Get Featured Courses Controller
 */
exports.getFeaturedCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getFeaturedCourses();
    return successResponse(
      res,
      200,
      "Featured courses retrieved successfully",
      courses
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Full Course Details Controller (for editing)
 */
exports.getFullCourseDetails = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const instructorId = req.user.id;
    const courseDetails = await courseService.getFullCourseDetails(
      courseId,
      instructorId
    );
    return successResponse(res, 200, "Course details retrieved successfully", {
      courseDetails,
    });
  } catch (error) {
    next(error);
  }
};
