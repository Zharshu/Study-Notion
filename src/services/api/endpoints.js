const BASE_URL =
  process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"; // Use .env value dynamically

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  GOOGLE_LOGIN_API: BASE_URL + "/auth/google",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
  REFRESH_TOKEN_API: BASE_URL + "/auth/refresh",
  LOGOUT_API: BASE_URL + "/auth/logout",
  LOGOUT_ALL_API: BASE_URL + "/auth/logout-all",
};

// PROFILE ENDPOINTS - Updated to match backend /auth routes
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/auth/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/auth/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/auth/instructorDashboard",
};

// STUDENTS ENDPOINTS - Updated to match backend /student routes
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/student/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/student/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/student/sendPaymentSuccessEmail",
};

// COURSE ENDPOINTS - Redistributed to match backend feature-based routes
export const courseEndpoints = {
  // Instructor course management endpoints
  GET_ALL_COURSE_API: BASE_URL + "/instructor/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/instructor/course", // Append /:courseId in API calls
  EDIT_COURSE_API: BASE_URL + "/instructor/course", // Append /:courseId in API calls
  DELETE_COURSE_API: BASE_URL + "/instructor/course", // Append /:courseId in API calls
  CREATE_COURSE_API: BASE_URL + "/instructor/createCourse",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/instructor/getInstructorCourses",
  GET_FEATURED_COURSES_API: BASE_URL + "/instructor/getFeaturedCourses",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/instructor/getFullCourseDetails",

  // Category endpoints
  CREATE_CATEGORY_API: BASE_URL + "/admin/category",

  // Section management endpoints
  CREATE_SECTION_API: BASE_URL + "/instructor/createSection",
  UPDATE_SECTION_API: BASE_URL + "/instructor/section", // Append /:sectionId in API calls
  DELETE_SECTION_API: BASE_URL + "/instructor/deleteSection",

  // Subsection management endpoints
  CREATE_SUBSECTION_API: BASE_URL + "/instructor/createSubSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/instructor/subsection", // Append /:subsectionId in API calls
  DELETE_SUBSECTION_API: BASE_URL + "/instructor/deleteSubSection",

  // Category endpoints (Admin)
  COURSE_CATEGORIES_API: BASE_URL + "/admin/category",
  CREATE_CATEGORY_API: BASE_URL + "/admin/category",

  // Student course endpoints
  LECTURE_COMPLETION_API: BASE_URL + "/student/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/student/createRating",

  // AI Assistant endpoints
  ENHANCE_TEXT_API: BASE_URL + "/instructor/ai/rewrite-text",
};

// RATINGS AND REVIEWS - Updated to match backend /student routes
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/student/reviews", // Append /:courseId in API calls
};

// CATEGORIES API - Updated to match backend /admin routes
export const categories = {
  CATEGORIES_API: BASE_URL + "/admin/category",
};

// CATALOG PAGE DATA - Updated to match backend /admin routes
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/admin/category", // Append /:categoryId in API calls
};

// CONTACT-US API - Updated to match backend /auth routes
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/auth/contact",
};

// ADMIN ENDPOINTS
export const adminEndpoints = {
  // Dashboard & Analytics
  GET_PLATFORM_STATS_API: BASE_URL + "/admin/dashboard/stats",
  GET_ANALYTICS_API: BASE_URL + "/admin/dashboard/analytics",

  // User Management
  GET_ALL_USERS_API: BASE_URL + "/admin/users",
  GET_USER_BY_ID_API: BASE_URL + "/admin/users", // Append /:userId
  SUSPEND_USER_API: BASE_URL + "/admin/users", // Append /:userId/suspend
  UNSUSPEND_USER_API: BASE_URL + "/admin/users", // Append /:userId/unsuspend
  DELETE_USER_API: BASE_URL + "/admin/users", // Append /:userId

  // Course Management
  GET_PENDING_COURSES_API: BASE_URL + "/admin/courses/pending",
  UPDATE_COURSE_APPROVAL_API: BASE_URL + "/admin/courses", // Append /:courseId/approval
  TOGGLE_FEATURED_COURSE_API: BASE_URL + "/admin/courses", // Append /:courseId/featured

  // Category Management
  UPDATE_CATEGORY_API: BASE_URL + "/admin/category", // Append /:categoryId
  DELETE_CATEGORY_API: BASE_URL + "/admin/category", // Append /:categoryId
};

// SETTINGS PAGE API - Updated to match backend /auth routes
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/auth/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/auth/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/auth/deleteProfile",
  CAN_DELETE_ACCOUNT_API: BASE_URL + "/auth/canDeleteAccount",
};
