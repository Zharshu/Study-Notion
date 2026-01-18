const { Course, User, CourseProgress } = require("../../../shared/models");
const {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} = require("../../../shared/errors");
const { instance } = require("../../../config/razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const mailSender = require("../../../shared/utils/email/emailSender");
const {
  courseEnrollmentEmail,
} = require("../../../shared/utils/email/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../../../shared/utils/email/templates/paymentSuccessEmail");

/**
 * Capture payment and initiate Razorpay order
 * @param {Array} courses - Array of course IDs
 * @param {string} userId - User ID
 * @returns {Object} Razorpay order response
 * @throws {ValidationError} If courses empty or user already enrolled
 * @throws {NotFoundError} If course not found
 */
exports.capturePayment = async (courses, userId) => {
  if (!courses || courses.length === 0) {
    throw new ValidationError("Please provide course ID");
  }

  let totalAmount = 0;
  const uid = new mongoose.Types.ObjectId(userId);

  // Validate all courses and calculate total
  for (const courseId of courses) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new NotFoundError("Could not find the course");
    }

    // Check if course is approved
    if (course.approvalStatus !== "Approved") {
      throw new AuthorizationError(
        "This course is not available for enrollment at this time"
      );
    }

    // Check if user already enrolled
    if (course.studentsEnrolled.includes(uid)) {
      throw new ValidationError(
        "Student is already enrolled in one or more courses"
      );
    }

    totalAmount += course.price;
  }

  // Create Razorpay order
  const options = {
    amount: totalAmount * 100, // Convert to paise
    currency: "INR",
    receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  };

  const paymentResponse = await instance.orders.create(options);

  return {
    id: paymentResponse.id, // Changed from orderId to id for frontend compatibility
    orderId: paymentResponse.id,
    currency: paymentResponse.currency,
    amount: paymentResponse.amount,
  };
};

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentData - Payment verification data
 * @param {Array} courses - Courses to enroll in
 * @param {string} userId - User ID
 * @returns {Object} Enrollment result
 * @throws {ValidationError} If signature invalid
 */
exports.verifyPayment = async (paymentData, courses, userId) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    paymentData;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    throw new ValidationError(
      "Payment verification failed: Missing required fields"
    );
  }

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  console.log("=== Payment Verification Debug ===");
  console.log("Order ID:", razorpay_order_id);
  console.log("Payment ID:", razorpay_payment_id);
  console.log("Received Signature:", razorpay_signature);
  console.log("Expected Signature:", expectedSignature);
  console.log("Signatures Match:", expectedSignature === razorpay_signature);
  console.log("RAZORPAY_SECRET exists:", !!process.env.RAZORPAY_SECRET);

  if (expectedSignature !== razorpay_signature) {
    throw new ValidationError("Payment verification failed: Invalid signature");
  }

  // Enroll students in courses
  await this.enrollStudents(courses, userId);

  return {
    message: "Payment verified and enrollment successful",
  };
};

/**
 * Enroll student in courses
 * @param {Array} courses - Course IDs
 * @param {string} userId - User ID
 * @returns {Object} Enrollment result
 */
exports.enrollStudents = async (courses, userId) => {
  if (!courses || !userId) {
    throw new ValidationError("Please provide course ID and user ID");
  }

  const enrolledCourses = [];

  for (const courseId of courses) {
    // Enroll student in course
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { studentsEnrolled: userId } },
      { new: true }
    );

    if (!enrolledCourse) {
      throw new NotFoundError(`Course not found: ${courseId}`);
    }

    // Create course progress
    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId: userId,
      completedVideos: [],
    });

    // Update user's enrolled courses
    const user = await User.findById(userId);
    if (user) {
      user.courses.push(courseId);
      user.courseProgress.push(courseProgress._id);

      // Add credits for enrollment
      user.credits = (user.credits || 0) + 10;
      await user.save();

      // Send enrollment email
      try {
        await mailSender(
          user.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${user.firstName} ${user.lastName}`
          )
        );
      } catch (emailError) {
        console.error("Error sending enrollment email:", emailError);
        // Don't fail enrollment if email fails
      }

      enrolledCourses.push({
        courseId,
        courseName: enrolledCourse.courseName,
      });
    }
  }

  return {
    enrolledCourses,
    message: "Enrollment successful",
  };
};

/**
 * Send payment success email
 * @param {Object} paymentInfo - Payment information
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
exports.sendPaymentSuccessEmail = async (paymentInfo, userId) => {
  const { orderId, paymentId, amount } = paymentInfo;

  if (!orderId || !paymentId || !amount || !userId) {
    throw new ValidationError("Please provide all payment details");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  await mailSender(
    user.email,
    "Payment Received",
    paymentSuccessEmail(
      `${user.firstName} ${user.lastName}`,
      amount / 100, // Convert from paise to rupees
      orderId,
      paymentId
    )
  );

  return {
    message: "Payment success email sent",
  };
};
