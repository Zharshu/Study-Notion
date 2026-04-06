const { OpenAI } = require("openai");
const fs = require("fs");
require("dotenv").config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhance and rewrite text using OpenAI
 * @param {string} text - The rough text to enhance
 * @returns {string} The professionally rewritten text
 */
exports.enhanceText = async (text) => {
  try {
    console.log("🤖 Enhancing text with OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using fast mini model
      messages: [
        {
          role: "system",
          content:
            "You are an expert copywriter for an educational platform. Rewrite the given text to make it sound highly professional, engaging, and grammatically perfect. ONLY return the rewritten text, with no conversational filler.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ Error enhancing text with OpenAI:", error.message);
    throw error;
  }
};

/**
 * Transcribe Audio using OpenAI Whisper
 * @param {Object} audioFile - The audio file object from express-fileupload
 * @returns {string} The transcribed text
 */
exports.transcribeAudio = async (tempFilePath) => {
  try {
    console.log("🗣️ Transcribing audio with Whisper...");
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    return transcription.text;
  } catch (error) {
    console.error("❌ Error transcribing audio:", error.message);
    throw error;
  }
};
