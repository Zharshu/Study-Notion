const contactService = require('../services/contact.service');
const { successResponse } = require('../../../shared/utils/responseHandler');

/**
 * Contact Us Controller
 */
exports.contactUsController = async (req, res, next) => {
  try {
    const result = await contactService.contactUs(req.body);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};