const { Section, Course, SubSection } = require('../../../shared/models');
const { ValidationError, NotFoundError, AuthorizationError } = require('../../../shared/errors');

/**
 * Create a new section
 * @param {Object} sectionData - { sectionName, courseId }
 * @param {string} instructorId - Instructor ID
 * @returns {Object} Created section with updated course
 */
exports.createSection = async (sectionData, instructorId) => {
  const { sectionName, courseId } = sectionData;

  if (!sectionName || !courseId) {
    throw new ValidationError('Section name and course ID are required');
  }

  // Verify course exists and instructor owns it
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError('You can only add sections to your own courses');
  }

  // Create section
  const newSection = await Section.create({ sectionName });

  // Add section to course
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { $push: { courseContent: newSection._id } },
    { new: true }
  ).populate({
    path: 'courseContent',
    populate: { path: 'subSection' }
  });

  return {
    section: newSection,
    course: updatedCourse
  };
};

/**
 * Update a section
 * @param {string} sectionId - Section ID
 * @param {Object} updates - { sectionName }
 * @param {string} instructorId - Instructor ID
 * @returns {Object} Updated section
 */
exports.updateSection = async (sectionId, updates, instructorId) => {
  const { sectionName } = updates;

  if (!sectionName) {
    throw new ValidationError('Section name is required');
  }

  const section = await Section.findById(sectionId);
  if (!section) {
    throw new NotFoundError('Section not found');
  }

  // Verify ownership through course
  const course = await Course.findOne({ courseContent: sectionId });
  if (!course) {
    throw new NotFoundError('Course not found for this section');
  }

  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError('You can only update sections in your own courses');
  }

  section.sectionName = sectionName;
  await section.save();

  return section;
};

/**
 * Delete a section
 * @param {string} sectionId - Section ID
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor ID
 * @returns {Object} Success message
 */
exports.deleteSection = async (sectionId, courseId, instructorId) => {
  if (!sectionId || !courseId) {
    throw new ValidationError('Section ID and Course ID are required');
  }

  // Verify course ownership
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError('You can only delete sections from your own courses');
  }

  // Find section
  const section = await Section.findById(sectionId);
  if (!section) {
    throw new NotFoundError('Section not found');
  }

  // Delete all subsections in this section
  if (section.subSection && section.subSection.length > 0) {
    await SubSection.deleteMany({ _id: { $in: section.subSection } });
  }

  // Remove section from course
  await Course.findByIdAndUpdate(
    courseId,
    { $pull: { courseContent: sectionId } }
  );

  // Delete section
  await Section.findByIdAndDelete(sectionId);

  return { message: 'Section deleted successfully' };
};

/**
 * Get section details with subsections
 * @param {string} sectionId - Section ID
 * @returns {Object} Section with populated subsections
 */
exports.getSectionDetails = async (sectionId) => {
  const section = await Section.findById(sectionId)
    .populate('subSection')
    .exec();

  if (!section) {
    throw new NotFoundError('Section not found');
  }

  return section;
};
