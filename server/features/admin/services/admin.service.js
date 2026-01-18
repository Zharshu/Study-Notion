const { User, Course } = require("../../../shared/models");
const {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} = require("../../../shared/errors");

/**
 * Get all users (admin only)
 * @returns {Array} List of all users
 */
exports.getAllUsers = async () => {
  const users = await User.find({})
    .select("-password -token -resetPasswordExpires")
    .populate("additionalDetails")
    .sort({ createdAt: -1 });

  return users;
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User details
 */
exports.getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password")
    .populate("additionalDetails")
    .populate("courses");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

const mailSender = require("../../../shared/utils/email/emailSender");
const accountDeletionTemplate = require("../../../shared/utils/email/templates/accountDeletionTemplate");
const accountSuspensionTemplate = require("../../../shared/utils/email/templates/accountSuspensionTemplate");
const accountUnsuspensionTemplate = require("../../../shared/utils/email/templates/accountUnsuspensionTemplate");

// ... existing imports

/**
 * Suspend/Unsuspend user account
 * @param {string} userId - User ID
 * @param {string} reason - Suspension reason
 * @param {boolean} suspend - true to suspend, false to unsuspend
 * @returns {Object} Updated user
 */
exports.toggleUserSuspension = async (userId, reason, suspend = true) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.suspended = suspend;
  if (suspend) {
    user.suspensionReason = reason || "No reason provided";
  } else {
    user.suspensionReason = null;
  }

  await user.save();

  // Send notification email
  let emailSent = false;
  try {
    if (suspend) {
      await mailSender(
        user.email,
        "Account Suspended",
        accountSuspensionTemplate(
          `${user.firstName} ${user.lastName}`,
          user.suspensionReason
        )
      );
    } else {
      await mailSender(
        user.email,
        "Account Restored",
        accountUnsuspensionTemplate(`${user.firstName} ${user.lastName}`)
      );
    }
    emailSent = true;
  } catch (emailError) {
    console.log("Error sending suspension/unsuspension email:", emailError);
    // Don't throw error to client, just log it
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      suspended: user.suspended,
      suspensionReason: user.suspensionReason,
    },
    message:
      (suspend
        ? "User suspended successfully"
        : "User unsuspended successfully") +
      (emailSent ? "" : " (Email failed to send, check logs)"),
  };
};

/**
 * Delete user account
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
exports.deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  // Send notification email
  let emailSent = false;
  try {
    if (deletedUser) {
      await mailSender(
        deletedUser.email,
        "Account Deleted",
        accountDeletionTemplate(
          `${deletedUser.firstName} ${deletedUser.lastName}`
        )
      );
      emailSent = true;
    }
  } catch (emailError) {
    console.log("Error sending deletion email:", emailError);
  }

  return {
    message:
      "User deleted successfully" +
      (emailSent ? "" : " (Email failed to send, check logs)"),
  };
};

/**
 * Get all pending courses for approval
 * @returns {Array} Courses pending approval
 */
exports.getPendingCourses = async () => {
  // Query for courses with "Pending" or null approvalStatus (null defaults to Pending in schema)
  const courses = await Course.find({
    $or: [{ approvalStatus: "Pending" }, { approvalStatus: null }],
  })
    .populate("instructor", "firstName lastName email")
    .populate("category")
    .sort({ createdAt: -1 });

  return courses;
};

/**
 * Approve or reject a course
 * @param {string} courseId - Course ID
 * @param {string} status - 'Approved' or 'Rejected'
 * @param {string} reason - Rejection reason (optional)
 * @returns {Object} Updated course
 */
exports.updateCourseApproval = async (courseId, status, reason) => {
  if (!["Approved", "Rejected"].includes(status)) {
    throw new ValidationError("Invalid status. Must be Approved or Rejected");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    throw new NotFoundError("Course not found");
  }

  course.approvalStatus = status;
  if (status === "Rejected") {
    course.rejectionReason = reason || "No reason provided";
  }

  await course.save();

  return {
    course,
    message: `Course ${status.toLowerCase()} successfully`,
  };
};

/**
 * Get platform statistics
 * @returns {Object} Platform stats
 */
exports.getPlatformStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ accountType: "Student" });
  const totalInstructors = await User.countDocuments({
    accountType: "Instructor",
  });
  const totalAdmins = await User.countDocuments({ accountType: "Admin" });

  const totalCourses = await Course.countDocuments();

  // DEBUG: Check all courses and their approval status
  const allCourses = await Course.find(
    {},
    { courseName: 1, approvalStatus: 1, status: 1 }
  );
  console.log("=== ALL COURSES DEBUG ===");
  console.log("Total courses in DB:", totalCourses);
  allCourses.forEach((course) => {
    console.log(`  - ${course.courseName}:`);
    console.log(`     approvalStatus='${course.approvalStatus}'`);
    console.log(`     typeof: ${typeof course.approvalStatus}`);
    console.log(`     JSON: ${JSON.stringify(course.approvalStatus)}`);
    console.log(`     Raw value: `, course.toObject().approvalStatus);
    console.log(`     status='${course.status}'`);
  });

  // Use aggregation to trim whitespace and count by status
  const statusCounts = await Course.aggregate([
    {
      $project: {
        trimmedStatus: { $trim: { input: "$approvalStatus" } },
      },
    },
    {
      $group: {
        _id: "$trimmedStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  console.log("Aggregation result:", JSON.stringify(statusCounts, null, 2));

  // Convert aggregation result to counts
  const counts = { Approved: 0, Pending: 0, Rejected: 0 };
  statusCounts.forEach((item) => {
    if (item._id === "Approved") counts.Approved = item.count;
    if (item._id === "Pending") counts.Pending = item.count;
    if (item._id === "Rejected") counts.Rejected = item.count;
    // Handle null values (courses with null approvalStatus default to "Pending")
    if (item._id === null) counts.Pending += item.count;
  });

  const approvedCourses = counts.Approved;
  const pendingCourses = counts.Pending;
  const rejectedCourses = counts.Rejected;

  console.log("Approved count:", approvedCourses);
  console.log("Pending count:", pendingCourses);
  console.log("Rejected count:", rejectedCourses);
  console.log("=== END DEBUG ===");

  // Calculate total revenue from enrolled students
  const courses = await Course.find({ approvalStatus: "Approved" }).select(
    "price studentsEnrolled"
  );
  let totalRevenue = 0;
  courses.forEach((course) => {
    totalRevenue +=
      (course.price || 0) * (course.studentsEnrolled?.length || 0);
  });

  return {
    totalUsers,
    totalCourses,
    pendingCourses,
    totalRevenue,
    usersByRole: {
      Student: totalStudents,
      Instructor: totalInstructors,
      Admin: totalAdmins,
    },
    coursesByStatus: {
      Approved: approvedCourses,
      Pending: pendingCourses,
      Rejected: rejectedCourses,
    },
  };
};
/**
 * Toggle Featured Status of a Course
 * @param {string} courseId
 * @returns {Object} Updated Course
 */
exports.toggleFeaturedCourse = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  course.featured = !course.featured;
  course.featuredAt = course.featured ? new Date() : null;

  await course.save();
  return course;
};
