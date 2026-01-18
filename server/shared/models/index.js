/**
 * Models Index
 * Central export point for all database models
 */

const User = require('./User');
const Profile = require('./Profile');
const Course = require('./Course');
const Section = require('./Section');
const SubSection = require('./SubSection');
const Category = require('./Category');
const CourseProgress = require('./CourseProgress');
const RatingAndReview = require('./RatingAndRaview');
const OTP = require('./OTP');
const RefreshToken = require('./RefreshToken');
const AuditLog = require('./AuditLog');
const Refund = require('./Refund');

module.exports = {
  User,
  Profile,
  Course,
  Section,
  SubSection,
  Category,
  CourseProgress,
  RatingAndReview,
  OTP,
  RefreshToken,
  AuditLog,
  Refund
};
