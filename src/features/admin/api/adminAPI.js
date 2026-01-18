import { apiConnector } from "../../../services/api/client";
import { toast } from "react-hot-toast";

const { REACT_APP_BASE_URL } = process.env;

// ═══════════════════════════════════════════════════
// DASHBOARD & ANALYTICS
// ═══════════════════════════════════════════════════

export const getAdminDashboard = async (token, startDate = null, endDate = null) => {
  const toastId = toast.loading("Loading dashboard...");
  try {
    // Build query params
    let url = `${REACT_APP_BASE_URL}/admin/dashboard`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await apiConnector(
      "GET",
      url,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Dashboard loaded");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not fetch dashboard");
    console.error("GET_ADMIN_DASHBOARD_API ERROR:", error);
  } finally {
    toast.dismiss(toastId);
  }
};

// Get analytics chart data
export const getAnalyticsChartData = async (token, startDate = null, endDate = null) => {
  try {
    let url = `${REACT_APP_BASE_URL}/admin/analytics/charts`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await apiConnector(
      "GET",
      url,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error("GET_ANALYTICS_CHART_DATA_API ERROR:", error);
    return null;
  }
};


// ═══════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════

export const getAllUsers = async (token, page = 1, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      ...filters,
    }).toString();

    const response = await apiConnector(
      "GET",
      `${REACT_APP_BASE_URL}/admin/users?${queryParams}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not fetch users");
    console.error("GET_ALL_USERS_API ERROR:", error);
  }
};

export const suspendUser = async (token, userId, reason) => {
  const toastId = toast.loading("Suspending user...");
  try {
    const response = await apiConnector(
      "PUT",
      `${REACT_APP_BASE_URL}/admin/users/${userId}/suspend`,
      { reason },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("User suspended successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not suspend user");
    console.error("SUSPEND_USER_API ERROR:", error);
  } finally {
    toast.dismiss(toastId);
  }
};

export const activateUser = async (token, userId) => {
  const toastId = toast.loading("Activating user...");
  try {
    const response = await apiConnector(
      "PUT",
      `${REACT_APP_BASE_URL}/admin/users/${userId}/activate`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("User activated successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not activate user");
    console.error("ACTIVATE_USER_API ERROR:", error);
  } finally {
    toast.dismiss(toastId);
  }
};

// ═══════════════════════════════════════════════════
// COURSE MANAGEMENT
// ═══════════════════════════════════════════════════

export const getAllCourses = async (token, page = 1, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      ...filters,
    }).toString();

    const response = await apiConnector(
      "GET",
      `${REACT_APP_BASE_URL}/admin/courses?${queryParams}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not fetch courses");
    console.error("GET_ALL_COURSES_API ERROR:", error);
  }
};

export const getPendingCourses = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${REACT_APP_BASE_URL}/admin/courses/pending`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not fetch pending courses");
    console.error("GET_PENDING_COURSES_API ERROR:", error);
    return [];
  }
};

export const approveCourse = async (token, courseId) => {
  const toastId = toast.loading("Approving course...");
  try {
    const response = await apiConnector(
      "PUT",
      `${REACT_APP_BASE_URL}/admin/courses/${courseId}/approve`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Course approved successfully");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not approve course");
    console.error("APPROVE_COURSE_API ERROR:", error);
  } finally {
    toast.dismiss(toastId);
  }
};

export const rejectCourse = async (token, courseId, reason) => {
  const toastId = toast.loading("Rejecting course...");
  try {
    const response = await apiConnector(
      "PUT",
      `${REACT_APP_BASE_URL}/admin/courses/${courseId}/reject`,
      { reason },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Course rejected");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not reject course");
    console.error("REJECT_COURSE_API ERROR:", error);
  } finally {
    toast.dismiss(toastId);
  }
};

export const featureCourse = async (token, courseId) => {
  const toastId = toast.loading("Featuring course...");
  try {
    const response = await apiConnector(
      "PUT",
      `${REACT_APP_BASE_URL}/admin/courses/${courseId}/feature`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Course featured");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not feature course");
    console.error("FEATURE_COURSE_API ERROR:", error);
  } finally {
    toast.dismiss(toastId);
  }
};

// ═══════════════════════════════════════════════════
// CATEGORY MANAGEMENT
// ═══════════════════════════════════════════════════

export const updateCategory = async (token, categoryId, data) => {
  const toastId = toast.loading("Updating category...");
  try {
    const response = await apiConnector(
      "PUT",
      `${REACT_APP_BASE_URL}/admin/categories/${categoryId}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Category updated");
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not update category");
    console.error("UPDATE_CATEGORY_API ERROR:", error);
  } finally {
    toast.dismiss(toastId);
  }
};

export const deleteCategory = async (token, categoryId) => {
  const toastId = toast.loading("Deleting category...");
  try {
    const response = await apiConnector(
      "DELETE",
      `${REACT_APP_BASE_URL}/admin/categories/${categoryId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Category deleted");
    return true;
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not delete category");
    console.error("DELETE_CATEGORY_API ERROR:", error);
  } finally {
    toast.dismiss(toastId);
  }
};
