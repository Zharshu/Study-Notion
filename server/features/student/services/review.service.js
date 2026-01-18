const { RatingAndReview, Course } = require('../../../shared/models');
const { ValidationError, NotFoundError, AuthorizationError } = require('../../../shared/errors');
const mongoose = require('mongoose');

/**
 * Create rating and review for a course
 * @param {Object} reviewData - { rating, review, courseId }
 * @param {string} userId - User ID
 * @returns {Object} Created review
 * @throws {NotFoundError} If user not enrolled
 * @throws {ValidationError} If already reviewed
 */
exports.createRating = async (reviewData, userId) => {
  const { rating, review, courseId } = reviewData;

  if (!rating || !courseId) {
    throw new ValidationError('Rating and course ID are required');
  }

  // Check if user is enrolled in course
  const courseDetails = await Course.findOne({
    _id: courseId,
    studentsEnrolled: { $elemMatch: { $eq: userId } }
  });

  if (!courseDetails) {
    throw new NotFoundError('Student is not enrolled in the course');
  }

  // Check if user already reviewed
  const alreadyReviewed = await RatingAndReview.findOne({
    user: userId,
    course: courseId
  });

  if (alreadyReviewed) {
    throw new ValidationError('Course is already reviewed by the user');
  }

  // Create rating and review
  const ratingReview = await RatingAndReview.create({
    rating,
    review: review || '',
    course: courseId,
    user: userId
  });

  // Update course with this rating/review
  await Course.findByIdAndUpdate(
    courseId,
    {
      $push: {
        ratingAndReviews: ratingReview._id
      }
    },
    { new: true }
  );

  return {
    ratingReview,
    message: 'Rating and review created successfully'
  };
};

/**
 * Get average rating for a course
 * @param {string} courseId - Course ID
 * @returns {Object} Average rating
 */
exports.getAverageRating = async (courseId) => {
  if (!courseId) {
    throw new ValidationError('Course ID is required');
  }

  const result = await RatingAndReview.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId)
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  if (result.length > 0) {
    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10 // Round to 1 decimal
    };
  }

  return {
    averageRating: 0,
    message: 'No ratings given till now'
  };
};

/**
 * Get all ratings and reviews
 * @returns {Array} All reviews with user and course details
 */
exports.getAllRating = async () => {
  const allReviews = await RatingAndReview.find({})
    .sort({ rating: 'desc' })
    .populate({
      path: 'user',
      select: 'firstName lastName email image'
    })
    .populate({
      path: 'course',
      select: 'courseName'
    })
    .exec();

  return {
    reviews: allReviews,
    count: allReviews.length
  };
};

/**
 * Get all reviews for a specific course
 * @param {string} courseId - Course ID
 * @returns {Array} Course reviews
 */
exports.getCourseReviews = async (courseId) => {
  if (!courseId) {
    throw new ValidationError('Course ID is required');
  }

  const courseReviews = await RatingAndReview.find({ course: courseId })
    .sort({ createdAt: 'desc' })
    .populate({
      path: 'user',
      select: 'firstName lastName image'
    })
    .exec();

  return {
    reviews: courseReviews,
    count: courseReviews.length
  };
};

/**
 * Update rating and review
 * @param {string} reviewId - Review ID
 * @param {Object} updateData - { rating, review }
 * @param {string} userId - User ID
 * @returns {Object} Updated review
 * @throws {NotFoundError} If review not found
 * @throws {AuthorizationError} If not review owner
 */
exports.updateRating = async (reviewId, updateData, userId) => {
  const { rating, review } = updateData;

  const existingReview = await RatingAndReview.findById(reviewId);

  if (!existingReview) {
    throw new NotFoundError('Review not found');
  }

  // Check ownership
  if (existingReview.user.toString() !== userId) {
    throw new AuthorizationError('You can only update your own reviews');
  }

  if (rating) existingReview.rating = rating;
  if (review !== undefined) existingReview.review = review;

  await existingReview.save();

  return {
    review: existingReview,
    message: 'Review updated successfully'
  };
};

/**
 * Delete rating and review
 * @param {string} reviewId - Review ID
 * @param {string} userId - User ID
 * @returns {Object} Success message
 * @throws {NotFoundError} If review not found
 * @throws {AuthorizationError} If not review owner
 */
exports.deleteRating = async (reviewId, userId) => {
  const existingReview = await RatingAndReview.findById(reviewId);

  if (!existingReview) {
    throw new NotFoundError('Review not found');
  }

  // Check ownership
  if (existingReview.user.toString() !== userId) {
    throw new AuthorizationError('You can only delete your own reviews');
  }

  // Remove from course
  await Course.findByIdAndUpdate(
    existingReview.course,
    {
      $pull: {
        ratingAndReviews: reviewId
      }
    }
  );

  await RatingAndReview.findByIdAndDelete(reviewId);

  return {
    message: 'Review deleted successfully'
  };
};
