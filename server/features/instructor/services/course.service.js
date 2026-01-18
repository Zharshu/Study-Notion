const { Course, User, Category } = require("../../../shared/models");
const {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} = require("../../../shared/errors");
const imageUploader = require("../../../shared/utils/file/imageUploader");

/**
 * Create a new course
 * @param {Object} courseData - Course details
 * @param {string} instructorId - Instructor user ID
 * @returns {Object} Created course
 */
exports.createCourse = async (courseData, instructorId, thumbnailFile) => {
  const {
    courseName,
    courseDescription,
    whatYouWillLearn,
    price,
    tag,
    category,
    status,
    instructions,
  } = courseData;

  // Validate required fields
  if (
    !courseName ||
    !courseDescription ||
    !whatYouWillLearn ||
    !price ||
    !category
  ) {
    throw new ValidationError("All mandatory fields are required");
  }

  // Validate category
  const categoryDetails = await Category.findById(category);
  if (!categoryDetails) {
    throw new NotFoundError("Category not found");
  }

  // Upload thumbnail
  let thumbnailUrl = "";
  if (thumbnailFile) {
    const thumbnail = await imageUploader.uploadImageToCloudinary(
      thumbnailFile,
      process.env.FOLDER_NAME,
    );
    thumbnailUrl = thumbnail.secure_url;
  }

  // Create course
  const newCourse = await Course.create({
    courseName,
    courseDescription,
    instructor: instructorId,
    whatYouWillLearn,
    price,
    tag,
    category,
    thumbnail: thumbnailUrl,
    status: status || "Draft",
    instructions,
    approvalStatus: "Pending", // Requires admin approval
  });

  // Add course to instructor's courses
  await User.findByIdAndUpdate(
    instructorId,
    { $push: { courses: newCourse._id } },
    { new: true },
  );

  // Add course to category
  await Category.findByIdAndUpdate(
    category,
    { $push: { courses: newCourse._id } },
    { new: true },
  );

  return newCourse;
};

/**
 * Update an existing course
 * @param {string} courseId - Course ID
 * @param {Object} updates - Fields to update
 * @param {string} instructorId - Instructor ID
 * @param {Object} thumbnailFile - New thumbnail file (optional)
 * @returns {Object} Updated course
 */
exports.updateCourse = async (
  courseId,
  updates,
  instructorId,
  thumbnailFile,
) => {
  // Find course and verify ownership
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError("You can only update your own courses");
  }

  console.log("Updating course:", courseId);
  console.log("Updates received:", updates);
  console.log("Category in updates:", updates.category);
  console.log("Current course category:", course.category);

  // If category is being updated, validate it
  if (updates.category) {
    const categoryDetails = await Category.findById(updates.category);
    if (!categoryDetails) {
      throw new NotFoundError("Category not found");
    }

    // Remove course from old category
    await Category.findByIdAndUpdate(course.category, {
      $pull: { courses: courseId },
    });

    // Add course to new category
    await Category.findByIdAndUpdate(updates.category, {
      $push: { courses: courseId },
    });
  }

  // Handle thumbnail  upload if provided
  if (thumbnailFile) {
    const thumbnail = await imageUploader.uploadImageToCloudinary(
      thumbnailFile,
      process.env.FOLDER_NAME,
    );
    updates.thumbnail = thumbnail.secure_url;
  }

  // Parse JSON strings
  if (typeof updates.tag === "string") {
    updates.tag = JSON.parse(updates.tag);
  }
  if (typeof updates.instructions === "string") {
    updates.instructions = JSON.parse(updates.instructions);
  }

  // Update the course
  const updatedCourse = await Course.findByIdAndUpdate(courseId, updates, {
    new: true,
  })
    .populate("category")
    .populate({
      path: "courseContent",
      populate: { path: "subSection" },
    });

  return updatedCourse;
};

/**
 * Get all courses for an instructor
 * @param {string} instructorId - Instructor ID
 * @returns {Array} List of courses
 */
exports.getInstructorCourses = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId })
    .sort({ createdAt: -1 })
    .populate("category")
    .populate("ratingAndReviews");

  return courses;
};

/**
 * Get course details with full content
 * @param {string} courseId - Course ID
 * @returns {Object} Course with populated sections and subsections
 */
exports.getCourseDetails = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate({
      path: "instructor",
      select: "firstName lastName email image",
    })
    .populate("category")
    .populate("ratingAndReviews")
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();

  if (!course) {
    throw new NotFoundError("Course not found");
  }

  return course;
};

/**
 * Update course details
 * @param {string} courseId - Course ID
 * @param {Object} updates - Fields to update
 * @param {string} instructorId - Instructor ID
 * @param {Object} thumbnailFile - Optional new thumbnail
 * @returns {Object} Updated course
 */
exports.updateCourse = async (
  courseId,
  updates,
  instructorId,
  thumbnailFile,
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new NotFoundError("Course not found");
  }

  // Verify ownership
  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError("You can only edit your own courses");
  }

  // Upload new thumbnail if provided
  if (thumbnailFile) {
    const thumbnail = await imageUploader.uploadImageToCloudinary(
      thumbnailFile,
      process.env.FOLDER_NAME,
    );
    updates.thumbnail = thumbnail.secure_url;
  }

  // Update course
  const updatedCourse = await Course.findByIdAndUpdate(courseId, updates, {
    new: true,
    runValidators: true,
  }).populate("courseContent");

  return updatedCourse;
};

/**
 * Delete a course
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor ID
 * @returns {Object} Success message
 */
exports.deleteCourse = async (courseId, instructorId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new NotFoundError("Course not found");
  }

  // Verify ownership
  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError("You can only delete your own courses");
  }

  // Remove course from instructor
  await User.findByIdAndUpdate(instructorId, { $pull: { courses: courseId } });

  // Remove course from category
  await Category.findByIdAndUpdate(course.category, {
    $pull: { courses: courseId },
  });

  // Delete the course
  await Course.findByIdAndDelete(courseId);

  return { message: "Course deleted successfully" };
};

/**
 * Get all published courses (for students)
 * @returns {Array} Published courses
 */
exports.getAllCourses = async () => {
  const courses = await Course.find(
    {
      status: "Published",
      approvalStatus: "Approved", // Only show approved courses
    },
    {
      courseName: true,
      price: true,
      thumbnail: true,
      instructor: true,
      ratingAndReviews: true,
      studentsEnrolled: true,
    },
  )
    .populate("instructor")
    .exec();

  return courses;
};

/**
 * Get Featured Courses (Public)
 * @returns {Array} Featured courses
 */
exports.getFeaturedCourses = async () => {
  const courses = await Course.find({
    status: "Published",
    approvalStatus: "Approved",
    featured: true,
  })
    .populate("instructor")
    .populate("ratingAndReviews")
    .sort({ featuredAt: -1 })
    .limit(5); // Limit to top 5

  return courses;
};

/**
 * Get full course details with populated sections and subsections (for editing)
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor ID
 * @returns {Object} Complete course details
 */
exports.getFullCourseDetails = async (courseId, instructorId) => {
  if (!courseId) {
    throw new ValidationError("Course ID is required");
  }

  const course = await Course.findById(courseId)
    .populate({
      path: "instructor",
      select: "firstName lastName email image",
    })
    .populate("category")
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .populate("ratingAndReviews")
    .exec();

  if (!course) {
    throw new NotFoundError("Course not found");
  }

  // Verify ownership or enrollment
  const isEnrolled = course.studentsEnrolled?.some(
    (studentId) => studentId.toString() === instructorId,
  );

  if (course.instructor._id.toString() !== instructorId && !isEnrolled) {
    throw new AuthorizationError("You are not authorized to view this course");
  }

  return course;
};
