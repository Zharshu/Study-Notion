const {
  User,
  Profile,
  Course,
  CourseProgress,
} = require("../../../shared/models");
const { NotFoundError } = require("../../../shared/errors");
const imageUploader = require("../../../shared/utils/file/imageUploader");
const {
  convertSecondsToDuration,
} = require("../../../shared/utils/formatters/timeFormatter");
const mongoose = require("mongoose");

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user details
 */
exports.updateProfile = async (userId, updateData) => {
  const {
    firstName,
    lastName,
    dateOfBirth = "",
    about = "",
    contactNumber = "",
    gender = "",
  } = updateData;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Update User fields (First/Last Name)
  if (firstName || lastName) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    await user.save();
  }

  // Update Profile fields
  const profile = await Profile.findById(user.additionalDetails);
  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  profile.dateOfBirth = dateOfBirth;
  profile.about = about;
  profile.contactNumber = contactNumber;
  profile.gender = gender;
  await profile.save();

  // Return updated user with details
  const updatedUser = await User.findById(userId)
    .populate("additionalDetails")
    .exec();

  return updatedUser;
};

/**
 * Delete user account
 * @param {string} userId - User ID
 */
exports.deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Delete Profile
  if (user.additionalDetails) {
    await Profile.findByIdAndDelete(user.additionalDetails);
  }

  // Unenroll from all courses
  // Optimized: Use updateMany instead of loop
  if (user.courses && user.courses.length > 0) {
    await Course.updateMany(
      { _id: { $in: user.courses } },
      { $pull: { studentsEnrolled: userId } },
    );
  }

  // Delete User
  await User.findByIdAndDelete(userId);

  // Delete Course Progress
  await CourseProgress.deleteMany({ userId: userId });

  return { message: "User deleted successfully" };
};

/**
 * Get all user details
 * @param {string} userId - User ID
 * @returns {Object} User details
 */
exports.getAllUserDetails = async (userId) => {
  const userDetails = await User.findById(userId)
    .populate("additionalDetails")
    .exec();

  if (!userDetails) {
    throw new NotFoundError("User not found");
  }

  return userDetails;
};

/**
 * Update display picture
 * @param {string} userId - User ID
 * @param {Object} file - Image file
 * @returns {Object} Updated user
 */
exports.updateDisplayPicture = async (userId, file) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const image = await imageUploader.uploadImageToCloudinary(
    file,
    process.env.FOLDER_NAME,
    1000,
    1000,
  );

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { image: image.secure_url },
    { new: true },
  ).populate("additionalDetails");

  return updatedUser;
};

/**
 * Get enrolled courses with progress
 * @param {string} userId - User ID
 * @returns {Array} List of enrolled courses with progress
 */
exports.getEnrolledCourses = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  let userDetails = await User.findOne({ _id: userId })
    .populate({
      path: "courses",
      populate: {
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      },
    })
    .exec();

  if (!userDetails) {
    throw new NotFoundError("User details not found");
  }

  userDetails = userDetails.toObject();

  if (!userDetails.courses) return [];

  for (let i = 0; i < userDetails.courses.length; i++) {
    let totalDurationInSeconds = 0;
    let subsectionLength = 0;

    for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
      const content = userDetails.courses[i].courseContent[j];
      if (content && content.subSection) {
        totalDurationInSeconds += content.subSection.reduce(
          (acc, curr) => acc + (parseInt(curr.timeDuration) || 0),
          0,
        );
        subsectionLength += content.subSection.length;
      }
    }

    userDetails.courses[i].totalDuration = convertSecondsToDuration(
      totalDurationInSeconds,
    );

    let courseProgressCount = await CourseProgress.findOne({
      courseID: userDetails.courses[i]._id,
      userId: userId,
    });

    courseProgressCount = courseProgressCount?.completedVideos?.length || 0;

    if (subsectionLength === 0) {
      userDetails.courses[i].progressPercentage = 0;
    } else {
      const multiplier = Math.pow(10, 2);
      userDetails.courses[i].progressPercentage =
        Math.round(
          (courseProgressCount / subsectionLength) * 100 * multiplier,
        ) / multiplier;
    }
  }

  return userDetails.courses;
};

/**
 * Get instructor dashboard stats
 * @param {string} instructorId - Instructor ID
 * @returns {Array} Course stats
 */
exports.instructorDashboard = async (instructorId) => {
  const courseDetails = await Course.find({ instructor: instructorId });

  const courseData = courseDetails.map((course) => {
    const totalStudentsEnrolled = course.studentsEnrolled?.length || 0;
    const totalAmountGenerated = totalStudentsEnrolled * (course.price || 0);

    return {
      _id: course._id,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      totalStudentsEnrolled,
      totalAmountGenerated,
    };
  });

  return courseData;
};
