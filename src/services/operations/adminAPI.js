import { toast } from "react-hot-toast";
import { apiConnector } from "../api/client";
import { adminEndpoints, categories } from "../api/endpoints";

const {
  GET_PLATFORM_STATS_API,
  GET_ANALYTICS_API,
  GET_ALL_USERS_API,
  GET_USER_BY_ID_API,
  SUSPEND_USER_API,
  UNSUSPEND_USER_API,
  DELETE_USER_API,
  GET_PENDING_COURSES_API,
  UPDATE_COURSE_APPROVAL_API,
  UPDATE_CATEGORY_API,
  DELETE_CATEGORY_API,
} = adminEndpoints;

// ==================== Dashboard & Analytics ====================

export const getPlatformStats = async (token) => {
  const toastId = toast.loading("Loading stats...");
  let result = null;
  try {
    const response = await apiConnector("GET", GET_PLATFORM_STATS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.log("GET_PLATFORM_STATS_API ERROR", error);
    toast.error(error.message || "Could not fetch platform stats");
  }
  toast.dismiss(toastId);
  return result;
};

export const getAnalytics = async (token, startDate, endDate) => {
  const toastId = toast.loading("Loading analytics...");
  let result = null;
  try {
    let url = GET_ANALYTICS_API;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await apiConnector("GET", url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.log("GET_ANALYTICS_API ERROR", error);
    toast.error(error.message || "Could not fetch analytics");
  }
  toast.dismiss(toastId);
  return result;
};

// ==================== User Management ====================

export const getAllUsers = async (token) => {
  const toastId = toast.loading("Loading users...");
  let result = null;
  try {
    const response = await apiConnector("GET", GET_ALL_USERS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.log("GET_ALL_USERS_API ERROR", error);
    toast.error(error.message || "Could not fetch users");
  }
  toast.dismiss(toastId);
  return result;
};

export const getUserById = async (userId, token) => {
  const toastId = toast.loading("Loading user details...");
  let result = null;
  try {
    const response = await apiConnector(
      "GET",
      `${GET_USER_BY_ID_API}/${userId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.log("GET_USER_BY_ID_API ERROR", error);
    toast.error(error.message || "Could not fetch user details");
  }
  toast.dismiss(toastId);
  return result;
};

export const suspendUser = async (userId, reason, token) => {
  const toastId = toast.loading("Suspending user...");
  let result = null;
  try {
    const response = await apiConnector(
      "PUT",
      `${SUSPEND_USER_API}/${userId}/suspend`,
      { reason },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("User suspended successfully");
    result = response.data.data;
  } catch (error) {
    console.log("SUSPEND_USER_API ERROR", error);
    toast.error(error.message || "Could not suspend user");
  }
  toast.dismiss(toastId);
  return result;
};

export const unsuspendUser = async (userId, token) => {
  const toastId = toast.loading("Unsuspending user...");
  let result = null;
  try {
    const response = await apiConnector(
      "PUT",
      `${UNSUSPEND_USER_API}/${userId}/unsuspend`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("User unsuspended successfully");
    result = response.data.data;
  } catch (error) {
    console.log("UNSUSPEND_USER_API ERROR", error);
    toast.error(error.message || "Could not unsuspend user");
  }
  toast.dismiss(toastId);
  return result;
};

export const deleteUser = async (userId, token) => {
  const toastId = toast.loading("Deleting user...");
  let result = false;
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_USER_API}/${userId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("User deleted successfully");
    result = true;
  } catch (error) {
    console.log("DELETE_USER_API ERROR", error);
    toast.error(error.message || "Could not delete user");
  }
  toast.dismiss(toastId);
  return result;
};

// ==================== Course Management ====================

export const getPendingCourses = async (token) => {
  const toastId = toast.loading("Loading pending courses...");
  let result = null;
  try {
    const response = await apiConnector("GET", GET_PENDING_COURSES_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    result = response.data.data;
  } catch (error) {
    console.log("GET_PENDING_COURSES_API ERROR", error);
    toast.error(error.message || "Could not fetch pending courses");
  }
  toast.dismiss(toastId);
  return result;
};

export const updateCourseApproval = async (courseId, status, reason, token) => {
  const toastId = toast.loading("Updating course status...");
  let result = null;
  try {
    const response = await apiConnector(
      "PUT",
      `${UPDATE_COURSE_APPROVAL_API}/${courseId}/approval`,
      { status, reason },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success(`Course ${status} successfully`);
    result = response.data.data;
  } catch (error) {
    console.log("UPDATE_COURSE_APPROVAL_API ERROR", error);
    toast.error(error.message || "Could not update course status");
  }
  toast.dismiss(toastId);
  return result;
};

export const updateFeaturedStatus = async (courseId, token) => {
  const toastId = toast.loading("Updating featured status...");
  let result = null;
  try {
    const response = await apiConnector(
      "PUT",
      `${adminEndpoints.TOGGLE_FEATURED_COURSE_API}/${courseId}/featured`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Course featured status updated");
    result = response.data.data;
  } catch (error) {
    console.log("UPDATE_FEATURED_STATUS_API ERROR", error);
    toast.error(error.message || "Could not update featured status");
  }
  toast.dismiss(toastId);
  return result;
};

// ==================== Category Management ====================

export const updateCategory = async (categoryId, data, token) => {
  const toastId = toast.loading("Updating category...");
  let result = null;
  try {
    const response = await apiConnector(
      "PUT",
      `${UPDATE_CATEGORY_API}/${categoryId}`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Category updated successfully");
    result = response.data.data;
  } catch (error) {
    console.log("UPDATE_CATEGORY_API ERROR", error);
    toast.error(error.message || "Could not update category");
  }
  toast.dismiss(toastId);
  return result;
};

export const deleteCategory = async (categoryId, token) => {
  const toastId = toast.loading("Deleting category...");
  let result = false;
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_CATEGORY_API}/${categoryId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Category deleted successfully");
    result = true;
  } catch (error) {
    console.log("DELETE_CATEGORY_API ERROR", error);
    toast.error(error.message || "Could not delete category");
  }
  toast.dismiss(toastId);
  return result;
};

export const createCategory = async (data, token) => {
  const toastId = toast.loading("Creating category...");
  let result = null;
  try {
    const response = await apiConnector(
      "POST",
      categories.CATEGORIES_API,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    toast.success("Category created successfully");
    result = response.data.data;
  } catch (error) {
    console.log("CREATE_CATEGORY_API ERROR", error);
    toast.error(error.message || "Could not create category");
  }
  toast.dismiss(toastId);
  return result;
};
