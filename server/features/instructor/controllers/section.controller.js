const sectionService = require('../services/section.service');
const { successResponse, createdResponse } = require('../../../shared/utils/responseHandler');

/**
 * Create Section Controller
 */
exports.createSection = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const result = await sectionService.createSection(req.body, instructorId);
    return createdResponse(res, 'Section created successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Section Controller
 */
exports.updateSection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const instructorId = req.user.id;
    
    const section = await sectionService.updateSection(sectionId, req.body, instructorId);
    return successResponse(res, 200, 'Section updated successfully', section);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Section Controller
 */
exports.deleteSection = async (req, res, next) => {
  try {
    const { sectionId, courseId } = req.body;
    const instructorId = req.user.id;
    
    const result = await sectionService.deleteSection(sectionId, courseId, instructorId);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};