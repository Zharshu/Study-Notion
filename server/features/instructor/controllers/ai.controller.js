const aiService = require("../../../shared/services/ai.service");
const { SubSection } = require("../../../shared/models");
const { ValidationError, NotFoundError } = require("../../../shared/errors");
const {
  successResponse,
  errorResponse,
} = require("../../../shared/utils/responseHandler");

/**
 * Generate or regenerate AI summary for a video
 * POST /api/instructor/ai/generate-video-summary
 */
exports.generateVideoSummary = async (req, res, next) => {
  try {
    const { subsectionId, regenerate = false } = req.body;
    const instructorId = req.user.id;

    if (!subsectionId) {
      throw new ValidationError("Subsection ID is required");
    }

    // Find subsection
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      throw new NotFoundError("Subsection not found");
    }

    // Check if summary already exists and regenerate is false
    if (
      subsection.aiSummary &&
      subsection.aiSummary.status === "completed" &&
      !regenerate
    ) {
      return successResponse(res, 200, "AI summary already exists", {
        aiSummary: subsection.aiSummary,
        message: "Use regenerate=true to create a new summary",
      });
    }

    // Check if AI service is ready
    if (!aiService.isAIServiceReady()) {
      return errorResponse(
        res,
        500,
        "AI service is not configured. Please contact administrator."
      );
    }

    // Update status to pending
    subsection.aiSummary = subsection.aiSummary || {};
    subsection.aiSummary.status = "pending";
    await subsection.save();

    // Generate AI summary
    console.log(
      `🤖 ${regenerate ? "Regenerating" : "Generating"} AI summary for: ${
        subsection.title
      }`
    );

    const aiSummary = await aiService.generateVideoSummary(
      subsection.videoUrl,
      subsection.title,
      subsection.description,
      subsection.timeDuration
    );

    // Update subsection with AI summary
    subsection.aiSummary = aiSummary;
    await subsection.save();

    return successResponse(
      res,
      200,
      `AI summary ${regenerate ? "regenerated" : "generated"} successfully`,
      { aiSummary }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI summary status for a subsection
 * GET /api/instructor/ai/summary-status/:subsectionId
 */
exports.getSummaryStatus = async (req, res, next) => {
  try {
    const { subsectionId } = req.params;

    if (!subsectionId) {
      throw new ValidationError("Subsection ID is required");
    }

    const subsection = await SubSection.findById(subsectionId).select(
      "title aiSummary"
    );

    if (!subsection) {
      throw new NotFoundError("Subsection not found");
    }

    const status = subsection.aiSummary?.status || "not_generated";
    const hasAISummary = !!subsection.aiSummary?.summary;

    return successResponse(res, 200, "Summary status retrieved", {
      status,
      hasAISummary,
      aiSummary: subsection.aiSummary,
      title: subsection.title,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI service configuration status
 * GET /api/instructor/ai/service-status
 */
exports.getAIServiceStatus = async (req, res, next) => {
  try {
    const isReady = aiService.isAIServiceReady();

    return successResponse(res, 200, "AI service status retrieved", {
      isConfigured: isReady,
      provider: process.env.AI_SERVICE_PROVIDER || "gemini",
      message: isReady
        ? "AI service is ready to generate summaries"
        : "AI service is not configured",
    });
  } catch (error) {
    next(error);
  }
};
