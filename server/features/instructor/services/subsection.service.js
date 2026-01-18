const { SubSection, Section, Course } = require("../../../shared/models");
const {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} = require("../../../shared/errors");
const imageUploader = require("../../../shared/utils/file/imageUploader");

/**
 * Create a new subsection (lecture)
 * @param {Object} subsectionData - Subsection details
 * @param {string} instructorId - Instructor ID
 * @param {Object} videoFile - Video file to upload
 * @returns {Object} Created subsection
 */
exports.createSubSection = async (subsectionData, instructorId, videoFile) => {
  const { sectionId, title, description, timeDuration } = subsectionData;

  if (!sectionId || !title || !description) {
    throw new ValidationError(
      "Section ID, title, and description are required",
    );
  }

  if (!videoFile) {
    throw new ValidationError("Video file is required");
  }

  // Verify section exists and instructor owns the course
  const section = await Section.findById(sectionId);
  if (!section) {
    throw new NotFoundError("Section not found");
  }

  // Find course containing this section
  const course = await Course.findOne({ courseContent: sectionId });
  if (!course) {
    throw new NotFoundError("Course not found for this section");
  }

  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError(
      "You can only add lectures to your own courses",
    );
  }

  // Upload video to Cloudinary - try with transcription, fallback without
  let videoUpload;
  try {
    // Try with transcription first
    videoUpload = await imageUploader.uploadImageToCloudinary(
      videoFile,
      process.env.FOLDER_NAME,
      1000,
      1000,
      {
        resource_type: "video",
        raw_convert: "google_speech", // Enable auto-transcription
      },
    );
  } catch (transcriptionError) {
    // If transcription fails (rate limit), upload without it
    console.log("⚠️ Transcription limit hit, uploading without transcription");
    videoUpload = await imageUploader.uploadImageToCloudinary(
      videoFile,
      process.env.FOLDER_NAME,
      1000,
      1000,
      {
        resource_type: "video",
        // No raw_convert - skip transcription
      },
    );
  }

  // Create subsection
  const newSubSection = await SubSection.create({
    title,
    timeDuration: timeDuration || `${videoUpload.duration}`,
    description,
    videoUrl: videoUpload.secure_url,
  });

  // Add subsection to section
  const updatedSection = await Section.findByIdAndUpdate(
    sectionId,
    { $push: { subSection: newSubSection._id } },
    { new: true },
  ).populate("subSection");

  // Generate AI summary in background (non-blocking)
  // Generate AI summary in background (non-blocking)
  generateAISummaryInBackground(
    newSubSection._id,
    title,
    description,
    timeDuration,
  );

  return {
    subsection: newSubSection,
    section: updatedSection,
  };
};

/**
 * Generate AI summary in background (non-blocking)
 * @param {string} subsectionId - Subsection ID
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @param {string} timeDuration - Video duration
 */
async function generateAISummaryInBackground(
  subsectionId,
  title,
  description,
  timeDuration,
) {
  try {
    const aiService = require("../../../shared/services/ai.service");

    // Check if AI service is configured
    if (!aiService.isAIServiceReady()) {
      console.log("⚠️ AI service not configured, skipping summary generation");
      return;
    }

    console.log(
      `🚀 Starting AI summary generation for subsection: ${subsectionId}`,
    );

    // Fetch subsection to get video URL
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      console.log(`❌ Subsection not found: ${subsectionId}`);
      return;
    }

    // Generate AI summary with actual video URL
    const aiSummary = await aiService.generateVideoSummary(
      subsection.videoUrl, // Pass actual video URL
      title,
      description,
      timeDuration,
    );

    // Update subsection with AI summary
    await SubSection.findByIdAndUpdate(
      subsectionId,
      { aiSummary },
      { new: true },
    );

    console.log(`✅ AI summary saved for subsection: ${subsectionId}`);
  } catch (error) {
    console.error(
      `❌ Error generating AI summary in background:`,
      error.message,
    );
    // Don't throw error - this is non-blocking
  }
}

/**
 * Update a subsection
 * @param {string} subsectionId - Subsection ID
 * @param {Object} updates - Fields to update
 * @param {string} instructorId - Instructor ID
 * @param {Object} videoFile - Optional new video file
 * @returns {Object} Updated subsection
 */
exports.updateSubSection = async (
  subsectionId,
  updates,
  instructorId,
  videoFile,
) => {
  const { title, description, timeDuration } = updates;

  const subsection = await SubSection.findById(subsectionId);
  if (!subsection) {
    throw new NotFoundError("Subsection not found");
  }

  // Verify ownership through section and course
  const section = await Section.findOne({ subSection: subsectionId });
  if (!section) {
    throw new NotFoundError("Section not found for this subsection");
  }

  const course = await Course.findOne({ courseContent: section._id });
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError(
      "You can only update lectures in your own courses",
    );
  }

  // Update fields
  if (title) subsection.title = title;
  if (description) subsection.description = description;
  if (timeDuration) subsection.timeDuration = timeDuration;

  // Upload new video if provided
  if (videoFile) {
    const videoUpload = await imageUploader.uploadImageToCloudinary(
      videoFile,
      process.env.FOLDER_NAME,
      1000,
      1000,
    );
    subsection.videoUrl = videoUpload.secure_url;
    subsection.timeDuration = `${videoUpload.duration}`;
  }

  await subsection.save();

  return subsection;
};

/**
 * Delete a subsection
 * @param {string} subsectionId - Subsection ID
 * @param {string} sectionId - Section ID
 * @param {string} instructorId - Instructor ID
 * @returns {Object} Success message
 */
exports.deleteSubSection = async (subsectionId, sectionId, instructorId) => {
  if (!subsectionId || !sectionId) {
    throw new ValidationError("Subsection ID and Section ID are required");
  }

  // Verify ownership
  const section = await Section.findById(sectionId);
  if (!section) {
    throw new NotFoundError("Section not found");
  }

  const course = await Course.findOne({ courseContent: sectionId });
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  if (course.instructor.toString() !== instructorId) {
    throw new AuthorizationError(
      "You can only delete lectures from your own courses",
    );
  }

  // Remove subsection from section
  await Section.findByIdAndUpdate(sectionId, {
    $pull: { subSection: subsectionId },
  });

  // Delete subsection
  await SubSection.findByIdAndDelete(subsectionId);

  return { message: "Lecture deleted successfully" };
};

/**
 * Get subsection details
 * @param {string} subsectionId - Subsection ID
 * @returns {Object} Subsection details
 */
exports.getSubSectionDetails = async (subsectionId) => {
  const subsection = await SubSection.findById(subsectionId);

  if (!subsection) {
    throw new NotFoundError("Subsection not found");
  }

  return subsection;
};
