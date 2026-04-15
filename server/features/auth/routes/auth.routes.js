// Import the required modules
const express = require("express");
const router = express.Router();

// Import the required controllers
const authController = require("../controllers/auth.controller");
const passwordController = require("../controllers/password.controller");
const profileController = require("../controllers/profile.controller");
const contactController = require("../controllers/contact.controller");

// Import middlewares
const { auth } = require("../../../shared/middlewares/auth.middleware");
const validate = require("../../../shared/middlewares/validation.middleware");
const {
  signupValidator,
  loginValidator,
  changePasswordValidator,
  resetPasswordValidator,
} = require("../validators/auth.validator");

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", loginValidator, validate, authController.login);

// Route for Google OAuth login/signup
router.post("/google", authController.googleAuth);

// Route for user signup
router.post("/signup", signupValidator, validate, authController.signup);

// Route for sending OTP to the user's email
router.post("/sendotp", authController.sendOTP);

// Route for Changing the password
router.post(
  "/changepassword",
  auth,
  changePasswordValidator,
  validate,
  authController.changePassword,
);

// Route for refreshing access token
router.post("/refresh", authController.refreshAccessToken);

// Route for user logout
router.post("/logout", authController.logout);

// Route for logging out from all devices
router.post("/logout-all", auth, authController.logoutAll);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", passwordController.resetPasswordToken);

// Route for resetting user's password after verification
router.post(
  "/reset-password",
  resetPasswordValidator,
  validate,
  passwordController.resetPassword,
);

// ********************************************************************************************************
//                                      Profile Routes
// ********************************************************************************************************

// Check if can delete account
router.get("/canDeleteAccount", auth, profileController.canDeleteAccount);

// Delet User Account
router.delete("/deleteProfile", auth, profileController.deleteAccount);
router.put("/updateProfile", auth, profileController.updateProfile);
router.get("/getUserDetails", auth, profileController.getAllUserDetails);

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, profileController.getEnrolledCourses);
router.put(
  "/updateDisplayPicture",
  auth,
  profileController.updateDisplayPicture,
);

// Instructor Dashboard
router.get("/instructorDashboard", auth, profileController.instructorDashboard);

// ********************************************************************************************************
//                                      Contact Us Route
// ********************************************************************************************************
router.post("/contact", contactController.contactUsController);

module.exports = router;
