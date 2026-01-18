const express = require("express");
const router = express.Router();

// Controllers
const adminController = require("../controllers/admin.controller");
const categoryController = require("../controllers/category.controller");
const analyticsController = require("../controllers/analytics.controller");

// Middlewares
const {
  auth,
  isAdmin,
} = require("../../../shared/middlewares/auth.middleware");
const validate = require("../../../shared/middlewares/validation.middleware");
const {
  categoryValidator,
  suspendUserValidator,
  approveCourseValidator,
} = require("../validators/admin.validator");

// ********************************************************************************************************
//                                      Admin Dashboard Routes
// ********************************************************************************************************

router.get("/dashboard/stats", auth, isAdmin, adminController.getPlatformStats);
router.get(
  "/dashboard/analytics",
  auth,
  isAdmin,
  analyticsController.getPlatformAnalytics
);

// ********************************************************************************************************
//                                      User Management Routes
// ********************************************************************************************************

router.get("/users", auth, isAdmin, adminController.getAllUsers);
router.get("/users/:userId", auth, isAdmin, adminController.getUserById);
router.put(
  "/users/:userId/suspend",
  auth,
  isAdmin,
  suspendUserValidator,
  validate,
  adminController.suspendUser
);
router.put(
  "/users/:userId/unsuspend",
  auth,
  isAdmin,
  adminController.unsuspendUser
);
router.delete("/users/:userId", auth, isAdmin, adminController.deleteUser);

// ********************************************************************************************************
//                                      Course Management Routes
// ********************************************************************************************************

router.get(
  "/courses/pending",
  auth,
  isAdmin,
  adminController.getPendingCourses
);
router.put(
  "/courses/:courseId/approval",
  auth,
  isAdmin,
  approveCourseValidator,
  validate,
  adminController.updateCourseApproval
);

// Toggle Featured Status
router.put(
  "/courses/:courseId/featured",
  auth,
  isAdmin,
  adminController.toggleFeaturedCourse
);

// ********************************************************************************************************
//                                      Category Routes (Admin Only)
// ********************************************************************************************************

router.post(
  "/category",
  auth,
  isAdmin,
  categoryValidator,
  validate,
  categoryController.createCategory
);
router.get("/category", categoryController.getAllCategories); // Public
router.get("/category/:categoryId", categoryController.getCategoryPageDetails); // Public

// Update Category (Admin Only)
router.put(
  "/category/:categoryId",
  auth,
  isAdmin,
  categoryValidator,
  validate,
  categoryController.updateCategory
);

// Delete Category (Admin Only)
router.delete(
  "/category/:categoryId",
  auth,
  isAdmin,
  categoryController.deleteCategory
);

module.exports = router;
