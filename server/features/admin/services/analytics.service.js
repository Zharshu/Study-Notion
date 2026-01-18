const { Course, User } = require("../../../shared/models");

/**
 * Get instructor analytics
 * @param {string} instructorId - Instructor ID
 * @returns {Object} Analytics data
 */
exports.getInstructorAnalytics = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId })
    .populate("studentsEnrolled")
    .populate("ratingAndReviews");

  const totalStudents = courses.reduce(
    (acc, course) => acc + course.studentsEnrolled.length,
    0
  );
  const totalRevenue = courses.reduce(
    (acc, course) => acc + course.price * course.studentsEnrolled.length,
    0
  );

  const courseStats = courses.map((course) => ({
    courseId: course._id,
    courseName: course.courseName,
    studentsEnrolled: course.studentsEnrolled.length,
    revenue: course.price * course.studentsEnrolled.length,
    averageRating:
      course.ratingAndReviews.length > 0
        ? (
            course.ratingAndReviews.reduce(
              (acc, review) => acc + review.rating,
              0
            ) / course.ratingAndReviews.length
          ).toFixed(1)
        : 0,
  }));

  return {
    totalCourses: courses.length,
    totalStudents,
    totalRevenue,
    courseStats,
  };
};

/**
 * Get platform-wide analytics (admin only)
 * @returns {Object} Platform analytics
 */
exports.getPlatformAnalytics = async (startDate, endDate) => {
  const match = {};
  if (startDate && endDate) {
    match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const totalUsers = await User.countDocuments(match);
  const totalCourses = await Course.countDocuments(match);

  // Active Users (Logged in last 30 days or in range)
  let activeUsersMatch = {
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  };

  if (startDate && endDate) {
    activeUsersMatch = {
      lastLogin: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
  }

  const activeUsers = await User.countDocuments(activeUsersMatch);

  // Revenue & Enrollments
  const revenueMatch = { approvalStatus: "Approved" };
  if (startDate && endDate) {
    Object.assign(revenueMatch, match);
  }

  const totalRevenueData = await Course.aggregate([
    { $match: revenueMatch },
    {
      $project: {
        revenue: {
          $multiply: ["$price", { $size: "$studentsEnrolled" }],
        },
        enrollments: { $size: "$studentsEnrolled" },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$revenue" },
        totalEnrollments: { $sum: "$enrollments" },
      },
    },
  ]);

  // Users By Type
  const usersByType = await User.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$accountType",
        count: { $sum: 1 },
      },
    },
  ]);

  // Courses By Category
  const coursesByCategory = await Course.aggregate([
    {
      $match: revenueMatch,
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $project: {
        category: { $arrayElemAt: ["$categoryDetails.name", 0] },
        count: 1,
      },
    },
  ]);

  // Top Performing Courses
  const coursesRaw = await Course.find(revenueMatch)
    .populate("ratingAndReviews")
    .populate("studentsEnrolled");

  const topCourses = coursesRaw
    .map((course) => {
      const totalRatings = course.ratingAndReviews.reduce(
        (acc, curr) => acc + curr.rating,
        0
      );
      const avgRating =
        course.ratingAndReviews.length > 0
          ? (totalRatings / course.ratingAndReviews.length).toFixed(1)
          : 0;

      return {
        name: course.courseName,
        enrollments: course.studentsEnrolled.length,
        revenue: course.price * course.studentsEnrolled.length,
        rating: avgRating,
      };
    })
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5);

  // Top Instructors
  const instructorsMap = {};
  const instructorIds = [...new Set(coursesRaw.map((c) => c.instructor))];
  const instructors = await User.find({ _id: { $in: instructorIds } });

  coursesRaw.forEach((course) => {
    const instructorId = course.instructor.toString();
    const instructor = instructors.find(
      (i) => i._id.toString() === instructorId
    );

    if (!instructorsMap[instructorId]) {
      instructorsMap[instructorId] = {
        name: instructor
          ? `${instructor.firstName} ${instructor.lastName}`
          : "Unknown",
        image: instructor ? instructor.image : null,
        students: 0,
        courses: 0,
        revenue: 0,
        totalRating: 0,
        reviewCount: 0,
      };
    }

    instructorsMap[instructorId].students += course.studentsEnrolled.length;
    instructorsMap[instructorId].courses += 1;
    instructorsMap[instructorId].revenue +=
      course.price * course.studentsEnrolled.length;

    const courseTotalRating = course.ratingAndReviews.reduce(
      (acc, curr) => acc + curr.rating,
      0
    );
    instructorsMap[instructorId].totalRating += courseTotalRating;
    instructorsMap[instructorId].reviewCount += course.ratingAndReviews.length;
  });

  const topInstructors = Object.values(instructorsMap)
    .map((inst) => ({
      ...inst,
      rating:
        inst.reviewCount > 0
          ? (inst.totalRating / inst.reviewCount).toFixed(1)
          : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // User Growth Trend
  let trendStartDate = new Date();
  trendStartDate.setMonth(trendStartDate.getMonth() - 6);

  if (startDate) {
    trendStartDate = new Date(startDate);
  }

  // Robust Match Construction
  const trendMatch = {
    createdAt: { $gte: trendStartDate },
  };
  if (endDate) {
    trendMatch.createdAt.$lte = new Date(endDate);
  }

  const userTrendData = await User.aggregate([
    {
      $match: trendMatch,
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      },
    },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Format Trend Data
  const trendLabels = [];
  const trendData = [];

  const endD = endDate ? new Date(endDate) : new Date();
  const loopDate = new Date(trendStartDate);

  // Safety check for loop
  if (loopDate <= endD) {
    while (loopDate <= endD) {
      const m = loopDate.getMonth() + 1;
      const y = loopDate.getFullYear();
      const label = loopDate.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });

      if (!trendLabels.includes(label)) {
        trendLabels.push(label);
        const found = userTrendData.find(
          (u) => u._id.month === m && u._id.year === y
        );
        trendData.push(found ? found.count : 0);
      }

      loopDate.setMonth(loopDate.getMonth() + 1);
      // Break if loopDate > Now + 2 years (safety)
      if (loopDate.getFullYear() > new Date().getFullYear() + 2) break;
    }
  }

  const userGrowth = {
    labels: trendLabels,
    data: trendData,
  };

  return {
    totalUsers,
    totalCourses,
    totalRevenue: totalRevenueData[0]?.totalRevenue || 0,
    totalEnrollments: totalRevenueData[0]?.totalEnrollments || 0,
    activeUsers,
    usersByType,
    coursesByCategory,
    topCourses,
    topInstructors,
    userGrowth,
  };
};

/**
 * Get monthly enrollment trends
 * @param {number} months - Number of months to fetch (default 6)
 * @returns {Array} Enrollment data by month
 */
exports.getEnrollmentTrends = async (months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const enrollmentData = await Course.aggregate([
    {
      $match: {
        approvalStatus: "Approved",
      },
    },
    {
      $project: {
        courseName: 1,
        enrollments: {
          $map: {
            input: "$studentsEnrolled",
            as: "student",
            in: {
              studentId: "$$student",
              month: { $month: new Date() },
            },
          },
        },
      },
    },
  ]);

  return enrollmentData;
};
