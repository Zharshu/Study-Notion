const subsectionService = require('../services/subsection.service');
const { successResponse, createdResponse } = require('../../../shared/utils/responseHandler');

/**
 * Create SubSection Controller
 */
exports.createSubSection = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const videoFile = req.files?.video;
    
    const result = await subsectionService.createSubSection(req.body, instructorId, videoFile);
    return createdResponse(res, 'Lecture created successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update SubSection Controller
 */
exports.updateSubSection = async (req, res, next) => {
  try {
    const { subsectionId } = req.params;
    const instructorId = req.user.id;
    const videoFile = req.files?.video;
    
    const subsection = await subsectionService.updateSubSection(subsectionId, req.body, instructorId, videoFile);
    return successResponse(res, 200, 'Lecture updated successfully', subsection);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete SubSection Controller
 */
exports.deleteSubSection = async (req, res, next) => {
  try {
    const { subsectionId, sectionId } = req.body;
    const instructorId = req.user.id;
    
    const result = await subsectionService.deleteSubSection(subsectionId, sectionId, instructorId);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};