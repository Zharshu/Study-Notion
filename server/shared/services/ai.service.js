const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

/**
 * Generate comprehensive AI summary for video lecture
 * @param {string} videoUrl - Cloudinary video URL
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @param {string} timeDuration - Video duration
 * @returns {Object} AI summary with key points, timestamps, and study notes
 */
exports.generateVideoSummary = async (
  videoUrl,
  title,
  description,
  timeDuration
) => {
  try {
    console.log(`🤖 Generating AI summary for: ${title}`);
    console.log(`📹 Video URL: ${videoUrl}`);

    // Step 1: Try to get video transcript from Cloudinary
    const transcript = await getVideoTranscript(videoUrl);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Working model as of Jan 2026

    // Step 2: Create prompt based on whether we have transcript or not
    let prompt;

    if (transcript && transcript.length > 50) {
      // We have a transcript! Use it for better summary
      console.log(
        `✅ Using video transcript (${transcript.length} chars) for summary generation`
      );

      prompt = `
You are an expert educational content analyzer. You have been provided with the ACTUAL TRANSCRIPT of a video lecture. Generate a comprehensive, accurate summary based on this transcript.

**Video Title:** ${title}
**Video Duration:** ${timeDuration || "Not specified"}
**Video Transcript:**
${transcript.substring(0, 8000)} ${
        transcript.length > 8000 ? "... (truncated for length)" : ""
      }

Based on the ACTUAL VIDEO CONTENT above, generate a detailed educational summary in the following JSON format:

{
  "summary": "Write a comprehensive 3-4 paragraph summary of what was ACTUALLY discussed in the video. Be specific and accurate based on the transcript.",
  "keyPoints": [
    "Extract 6-8 KEY POINTS that were ACTUALLY mentioned in the video",
    "Each point should be a specific takeaway from the transcript",
    "Include examples or details from the video if mentioned"
  ],
      "timestamps": [
        {
          "time": "0:00",
          "timeInSeconds": 0,
          "topic": "Introduction",
          "description": "Based on the beginning of the transcript, what topic is introduced?"
        },
        {
          "time": "2:00",
          "timeInSeconds": 120,
          "topic": "Middle Concept",
          "description": "What is discussed in the middle?"
        },
        {
          "time": "5:00",
          "timeInSeconds": 300,
          "topic": "Conclusion",
          "description": "How does it wrap up?"
        }
      ],
  "studyNotes": "Create detailed markdown study notes with:
  - Main headings for each major topic covered
  - Bullet points with specific details from the transcript
  - Code examples if mentioned in video
  - Key definitions or formulas if discussed
  - Summary section with main takeaways",
  "difficulty": "Assess as Beginner, Intermediate, or Advanced based on the complexity of content in transcript",
  "estimatedReadTime": "Estimate based on summary length (e.g., '5 min read')"
}

CRITICAL INSTRUCTIONS:
- Base EVERYTHING on the actual transcript content
- Be specific and accurate - don't make up information
- Extract real examples and details from the transcript
- Generate 4-6 timestamps distributed across the video duration
- Return ONLY valid JSON, no markdown code blocks
- Make study notes comprehensive and useful for revision
`;
    } else {
      // No transcript available, use title/description (fallback)
      console.log(
        `⚠️ No transcript available, using title/description for summary`
      );

      prompt = `
You are an expert educational content analyzer. Generate a comprehensive video summary based on this information:

Title: ${title}
Description: ${description}
Duration: ${timeDuration || "Not specified"}

Return a JSON object with this EXACT structure:
{
  "summary": "Create a detailed summary based on the title and description. Infer what the video might cover based on the topic.",
  "keyPoints": [
    "Key point 1 based on title/description",
    "Key point 2 based on likely content",
    "Key point 3 based on topic",
    "Key point 4 based on subject matter",
    "Key point 5 summarizing main concepts"
  ],
 "timestamps": [
    {
      "time": "0:00",
      "timeInSeconds": 0,
      "topic": "Introduction to ${title}",
      "description": "Opening and context setting"
    },
    {
      "time": "2:00",
      "timeInSeconds": 120,
      "topic": "Core Concept 1",
      "description": "First main topic likely covered"
    },
    {
      "time": "5:00",
      "timeInSeconds": 300,
      "topic": "Core Concept 2",
      "description": "Second main topic or practical example"
    }
  ],
  "studyNotes": "# ${title}\n\n## Overview\n${description}\n\n## Key Topics\n- Topic based on title\n- Concept inferred from description\n\n## Summary\nBrief revision notes\n",
  "difficulty": "Beginner",
  "estimatedReadTime": "3 min read"
}

IMPORTANT: 
- Return ONLY valid JSON
- timeInSeconds must be a NUMBER (not string)
- Base content on title and description
- Keep timestamps simple with numeric values
`;
    }

    // Step 3: Call Gemini AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Step 4: Clean and parse the response
    let cleanedText = text.trim();

    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    const aiSummary = JSON.parse(cleanedText);

    // Step 5: Add metadata
    aiSummary.generatedAt = new Date();
    aiSummary.aiModel = "gemini-2.5-flash";
    aiSummary.status = "completed";
    aiSummary.usedTranscript = !!transcript;

    console.log(`✅ AI summary generated successfully for: ${title}`);
    console.log(
      `📊 Used transcript: ${
        aiSummary.usedTranscript ? "Yes" : "No (fallback mode)"
      }`
    );

    return aiSummary;
  } catch (error) {
    console.error("❌ Error generating AI summary:", error.message);

    // Return fallback summary on error
    return {
      summary: `This video lecture titled "${title}" covers: ${description}`,
      keyPoints: [
        "Watch the full video for detailed explanation",
        "Take notes while watching",
        "Practice the concepts explained",
        "Review the material after watching",
      ],
      timestamps: [
        {
          time: "0:00",
          timeInSeconds: 0,
          topic: "Introduction",
          description: "Lecture begins",
        },
      ],
      studyNotes: `# ${title}\n\n${description}\n\n## Notes\n- Watch the video for detailed content\n- AI summary generation failed, please watch the full video`,
      difficulty: "Beginner",
      estimatedReadTime: "3 min read",
      generatedAt: new Date(),
      aiModel: "gemini-2.5-flash",
      status: "failed",
      usedTranscript: false,
    };
  }
};

/**
 * Get video transcript from Cloudinary
 * @param {string} videoUrl - Cloudinary video URL
 * @returns {string} Video transcript or empty string
 */
async function getVideoTranscript(videoUrl) {
  try {
    if (!videoUrl) {
      console.log("⚠️ No video URL provided");
      return "";
    }

    // Extract public_id from Cloudinary URL
    // Example URL: https://res.cloudinary.com/demo/video/upload/v1234567890/sample.mp4
    const urlParts = videoUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) {
      console.log("⚠️ Invalid Cloudinary URL format");
      return "";
    }

    // Get public_id (everything after /upload/vXXXXXXXXX/)
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // Remove extension

    console.log(`📝 Attempting to fetch transcript for public_id: ${publicId}`);

    // Cloudinary provides transcript in .transcript format
    // We'll try to fetch it using Cloudinary's resource API
    const cloudinary = require("cloudinary").v2;

    // Get resource info which includes transcript if available
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: "video",
      type: "upload",
    });

    // Check if transcript exists in info.raw_convert.google_speech
    if (
      resource.info &&
      resource.info.raw_convert &&
      resource.info.raw_convert.google_speech
    ) {
      const transcriptData = resource.info.raw_convert.google_speech;

      // Extract transcript text from response
      if (transcriptData.data && transcriptData.data.length > 0) {
        const fullTranscript = transcriptData.data
          .map((item) => item.transcript || "")
          .join(" ");

        console.log(
          `✅ Transcript fetched: ${fullTranscript.length} characters`
        );
        return fullTranscript;
      }
    }

    console.log("ℹ️ No transcript available for this video yet");
    return "";
  } catch (error) {
    console.log(`ℹ️ Could not fetch transcript: ${error.message}`);
    // Don't throw error - just return empty string as fallback
    return "";
  }
}

/**
 * Regenerate AI summary for an existing video
 * @param {string} videoUrl - Cloudinary video URL
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @param {string} timeDuration - Video duration
 * @returns {Object} Updated AI summary
 */
exports.regenerateVideoSummary = async (
  videoUrl,
  title,
  description,
  timeDuration
) => {
  console.log(`🔄 Regenerating AI summary for: ${title}`);
  return await exports.generateVideoSummary(
    videoUrl,
    title,
    description,
    timeDuration
  );
};

/**
 * Check if AI service is configured properly
 * @returns {boolean} True if AI service is ready
 */
exports.isAIServiceReady = () => {
  return !!process.env.GOOGLE_GEMINI_API_KEY;
};

/**
 * Get estimated cost for generating summary
 * @param {number} videoLengthInMinutes - Video length in minutes
 * @returns {string} Estimated cost in USD
 */
exports.getEstimatedCost = (videoLengthInMinutes) => {
  // Gemini Pro is currently free for most use cases
  // Estimation: ~$0 for free tier, ~$0.05 for paid tier
  return videoLengthInMinutes > 30 ? "$0.05" : "$0.00 (Free tier)";
};
