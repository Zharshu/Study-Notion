const { CourseProgress, SubSection, Course } = require('../../../shared/models');
const { ValidationError, NotFoundError } = require('../../../shared/errors');

/**
 * Update course progress
 * @param {string} courseId - Course ID
 * @param {string} subsectionId - Subsection ID
 * @param {string} userId - User ID
 * @returns {Object} Updated progress
 * @throws {NotFoundError} If subsection or progress not found
 * @throws {ValidationError} If subsection already completed
 */
exports.updateCourseProgress = async (courseId, subsectionId, userId) => {
  if (!courseId || !subsectionId || !userId) {
    throw new ValidationError('Course ID, subsection ID, and user ID are required');
  }

  // Validate subsection exists
  const subsection = await SubSection.findById(subsectionId);
  if (!subsection) {
    throw new NotFoundError('Invalid subsection');
  }

  // Find course progress
  let courseProgress = await CourseProgress.findOne({
    courseID: courseId,
    userId: userId
  });

  if (!courseProgress) {
    throw new NotFoundError('Course progress does not exist');
  }

  // Check if subsection already completed
  if (courseProgress.completedVideos.includes(subsectionId)) {
    throw new ValidationError('Subsection already completed');
  }

  // Add subsection to completed videos
  courseProgress.completedVideos.push(subsectionId);
  await courseProgress.save();

  // Calculate progress percentage
  const course = await Course.findById(courseId).populate({
    path: 'courseContent',
    populate: {
      path: 'subSection'
    }
  });

  let totalVideos = 0;
  if (course && course.courseContent) {
    course.courseContent.forEach(section => {
      if (section.subSection) {
        totalVideos += section.subSection.length;
      }
    });
  }

  const progressPercentage = totalVideos > 0 
    ? Math.round((courseProgress.completedVideos.length / totalVideos) * 100)
    : 0;

  return {
    courseProgress,
    progressPercentage,
    completedVideos: courseProgress.completedVideos.length,
    totalVideos,
    message: 'Course progress updated successfully'
  };
};

/**
 * Get course progress
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @returns {Object} Course progress details
 */
exports.getCourseProgress = async (courseId, userId) => {
  if (!courseId || !userId) {
    throw new ValidationError('Course ID and user ID are required');
  }

  const courseProgress = await CourseProgress.findOne({
    courseID: courseId,
    userId: userId
  });

  if (!courseProgress) {
    return {
      completedVideos: [],
      progressPercentage: 0
    };
  }

  // Get total videos in course
  const course = await Course.findById(courseId).populate({
    path: 'courseContent',
    populate: {
      path: 'subSection'
    }
  });

  let totalVideos = 0;
  if (course && course.courseContent) {
    course.courseContent.forEach(section => {
      if (section.subSection) {
        totalVideos += section.subSection.length;
      }
    });
  }

  const progressPercentage = totalVideos > 0 
    ? Math.round((courseProgress.completedVideos.length / totalVideos) * 100)
    : 0;

  return {
    completedVideos: courseProgress.completedVideos,
    progressPercentage,
    totalCompleted: courseProgress.completedVideos.length,
    totalVideos
  };
};
