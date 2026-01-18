const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema(
  {
    title: { type: String },
    timeDuration: { type: String },
    description: { type: String },
    videoUrl: { type: String },

    // AI Summary fields
    aiSummary: {
      summary: { type: String }, // Overall summary (2-3 paragraphs)
      keyPoints: [{ type: String }], // Array of key takeaways
      timestamps: [
        {
          time: { type: String }, // e.g., "2:30"
          timeInSeconds: { type: Number }, // e.g., 150
          topic: { type: String }, // e.g., "Introduction to Variables"
          description: { type: String }, // e.g., "Explains what variables are"
        },
      ],
      studyNotes: { type: String }, // Formatted markdown notes
      difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner",
      },
      estimatedReadTime: { type: String }, // e.g., "5 min read"
      generatedAt: { type: Date },
      aiModel: { type: String, default: "gemini-2.5-flash" }, // AI model used (Jan 2026)
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubSection", SubSectionSchema);
