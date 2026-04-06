const express = require("express");
const router = express.Router();

// Controllers
const courseController = require("../controllers/course.controller");
const sectionController = require("../controllers/section.controller");
const subsectionController = require("../controllers/subsection.controller");

// Middlewares
const {
  auth,
  isInstructor,
} = require("../../../shared/middlewares/auth.middleware");
const validate = require("../../../shared/middlewares/validation.middleware");
const {
  courseValidator,
  sectionValidator,
  subsectionValidator,
} = require("../validators/instructor.validator");

// ********************************************************************************************************
//                                      Course Routes
// ********************************************************************************************************

// Create Course
router.post(
  "/createCourse",
  auth,
  isInstructor,
  courseValidator,
  validate,
  courseController.createCourse,
);

// Get Instructor Courses
router.get(
  "/getInstructorCourses",
  auth,
  isInstructor,
  courseController.getInstructorCourses,
);

// Get Course Details
router.get("/course/:courseId", courseController.getCourseDetails); // Changed to GET/param

// Update Course
router.put(
  "/course/:courseId",
  auth,
  isInstructor,
  courseController.updateCourse,
); // Changed to PUT/param

// Delete Course
router.delete(
  "/course/:courseId",
  auth,
  isInstructor,
  courseController.deleteCourse,
); // Changed to DELETE/param

// Get All Published Courses (Public)
router.get("/getAllCourses", courseController.getAllCourses);

// Get Featured Courses (Public)
router.get("/getFeaturedCourses", courseController.getFeaturedCourses);

// Get Full Course Details (for editing)
router.post(
  "/getFullCourseDetails",
  auth,
  courseController.getFullCourseDetails,
);

// ********************************************************************************************************
//                                      Section Routes
// ********************************************************************************************************

// Create Section
router.post(
  "/createSection",
  auth,
  isInstructor,
  sectionValidator,
  validate,
  sectionController.createSection,
);

// Update Section
router.put(
  "/section/:sectionId",
  auth,
  isInstructor,
  sectionController.updateSection,
);

// Delete Section
router.post(
  "/deleteSection",
  auth,
  isInstructor,
  sectionController.deleteSection,
);
// Note: Kept as POST because it receives body {sectionId, courseId}, though DELETE is better rest practice

// ********************************************************************************************************
//                                      Subsection Routes
// ********************************************************************************************************

// Create Subsection
router.post(
  "/createSubSection",
  auth,
  isInstructor,
  subsectionValidator,
  validate,
  subsectionController.createSubSection,
);

// Update Subsection
router.put(
  "/subsection/:subsectionId",
  auth,
  isInstructor,
  subsectionController.updateSubSection,
);

// Delete Subsection
router.post(
  "/deleteSubSection",
  auth,
  isInstructor,
  subsectionController.deleteSubSection,
);

// ********************************************************************************************************
//                                      AI Routes (Video Summarization)
// ********************************************************************************************************

const aiController = require("../controllers/ai.controller");

// Generate or Regenerate AI Summary
router.post(
  "/ai/generate-video-summary",
  auth,
  isInstructor,
  aiController.generateVideoSummary,
);

// Get Summary Status
router.get(
  "/ai/summary-status/:subsectionId",
  auth,
  aiController.getSummaryStatus,
);

// Get AI Service Status
router.get(
  "/ai/service-status",
  auth,
  isInstructor,
  aiController.getAIServiceStatus,
);

// Enhance Text
router.post(
  "/ai/rewrite-text",
  auth,
  isInstructor,
  aiController.enhanceText,
);

module.exports = router;
