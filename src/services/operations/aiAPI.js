import { toast } from "react-hot-toast";
import { apiConnector } from "../api/client";

const AI_BASE_URL = "/api/instructor/ai";

/**
 * Generate or regenerate AI summary for a video
 */
export const generateVideoSummary = async (
  subsectionId,
  regenerate = false,
  token
) => {
  const toastId = toast.loading(
    regenerate ? "Regenerating AI summary..." : "Generating AI summary..."
  );
  let result = null;

  try {
    const response = await apiConnector(
      "POST",
      `${AI_BASE_URL}/generate-video-summary`,
      {
        subsectionId,
        regenerate,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("GENERATE_AI_SUMMARY API RESPONSE:", response);

    if (!response?.data?.success) {
      throw new Error(response.data.message || "Could not generate AI summary");
    }

    toast.success(
      response.data.message || "AI summary generated successfully!"
    );
    result = response?.data?.data?.aiSummary;
  } catch (error) {
    console.log("GENERATE_AI_SUMMARY API ERROR:", error);
    toast.error(
      error.response?.data?.message ||
        error.message ||
        "Failed to generate AI summary"
    );
  }

  toast.dismiss(toastId);
  return result;
};

/**
 * Get AI summary status for a subsection
 */
export const getAISummaryStatus = async (subsectionId, token) => {
  let result = null;

  try {
    const response = await apiConnector(
      "GET",
      `${AI_BASE_URL}/summary-status/${subsectionId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error("Could not get summary status");
    }

    result = response?.data?.data;
  } catch (error) {
    console.log("GET_AI_SUMMARY_STATUS API ERROR:", error);
  }

  return result;
};

/**
 * Check if AI service is configured and ready
 */
export const checkAIServiceStatus = async (token) => {
  let result = { isConfigured: false };

  try {
    const response = await apiConnector(
      "GET",
      `${AI_BASE_URL}/service-status`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (response?.data?.success) {
      result = response?.data?.data;
    }
  } catch (error) {
    console.log("CHECK_AI_SERVICE_STATUS API ERROR:", error);
  }

  return result;
};
