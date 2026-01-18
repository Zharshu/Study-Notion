const reviewService = require('../services/review.service');
const { successResponse, createdResponse } = require('../../../shared/utils/responseHandler');

/**
 * Create Rating Controller
 * Create a new rating and review for a course
 */
exports.createRating = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await reviewService.createRating(req.body, userId);
    
    return createdResponse(res, result.message, result.ratingReview);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Average Rating Controller
 * Get average rating for a course
 */
exports.getAverageRating = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const result = await reviewService.getAverageRating(courseId);
    
    return successResponse(
      res, 
      200, 
      result.message || 'Average rating fetched successfully',
      { averageRating: result.averageRating }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Ratings Controller
 * Get all ratings and reviews across all courses
 */
exports.getAllRating = async (req, res, next) => {
  try {
    const result = await reviewService.getAllRating();
    
    return successResponse(res, 200, 'All reviews fetched successfully', {
      reviews: result.reviews,
      count: result.count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Course Reviews Controller
 * Get all reviews for a specific course
 */
exports.getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const result = await reviewService.getCourseReviews(courseId);
    
    return successResponse(res, 200, 'Course reviews fetched successfully', {
      reviews: result.reviews,
      count: result.count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Rating Controller
 * Update an existing review
 */
exports.updateRating = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    
    const result = await reviewService.updateRating(reviewId, req.body, userId);
    return successResponse(res, 200, result.message, result.review);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Rating Controller
 * Delete a review
 */
exports.deleteRating = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    
    const result = await reviewService.deleteRating(reviewId, userId);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};