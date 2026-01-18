/**
 * Main Routes Aggregator
 * Combines all feature routes into a single router
 */

const express = require('express');
const router = express.Router();

// Import feature routes
const authRoutes = require('../features/auth/routes/auth.routes');
const adminRoutes = require('../features/admin/routes/admin.routes');
const instructorRoutes = require('../features/instructor/routes/instructor.routes');
const studentRoutes = require('../features/student/routes/student.routes');

// Mount feature routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/instructor', instructorRoutes);
router.use('/student', studentRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
