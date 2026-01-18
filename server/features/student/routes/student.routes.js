const express = require("express");
const router = express.Router();

// Controllers
const paymentController = require("../controllers/payment.controller");
const progressController = require("../controllers/progress.controller");
const reviewController = require("../controllers/review.controller");

// Middlewares
const {
  auth,
  isStudent,
} = require("../../../shared/middlewares/auth.middleware");
const validate = require("../../../shared/middlewares/validation.middleware");
const {
  paymentValidator,
  verifyPaymentValidator,
  progressValidator,
  reviewValidator,
} = require("../validators/student.validator");

// Payment Routes
router.post(
  "/capturePayment",
  auth,
  isStudent,
  paymentValidator,
  validate,
  paymentController.capturePayment
);
router.post(
  "/verifyPayment",
  auth,
  isStudent,
  verifyPaymentValidator,
  validate,
  paymentController.verifyPayment
);
router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  paymentController.sendPaymentSuccessEmail
);

// Course Progress Routes
router.post(
  "/updateCourseProgress",
  auth,
  isStudent,
  progressValidator,
  validate,
  progressController.updateCourseProgress
);
router.get(
  "/progress/:courseId",
  auth,
  isStudent,
  progressController.getCourseProgress
); // Changed to GET/params style

// Review Routes
router.post(
  "/createRating",
  auth,
  isStudent,
  reviewValidator,
  validate,
  reviewController.createRating
);
router.get("/getAverageRating", reviewController.getAverageRating);
router.get("/getAllRating", reviewController.getAllRating);
router.get("/reviews", reviewController.getAllRating); // Map /reviews to getAllRating
router.get("/reviews/:courseId", reviewController.getCourseReviews);

module.exports = router;
