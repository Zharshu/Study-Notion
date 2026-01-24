import axios from "axios";
import store from "../../store"; // Import Redux store
import { endpoints } from "./endpoints";
import toast from "react-hot-toast";

export const axiosInstance = axios.create({
  timeout: 300000, // 5 minutes (300 seconds) for large file uploads
  withCredentials: true, // Important: Send cookies with refresh token
});

// Flag to prevent multiple simultaneous refresh calls
let isRefreshing = false;
// Queue to store failed requests while refreshing
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - attach access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("⚠️ No token found in Redux store for request:", config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle token expiration and invalid tokens
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't logout on timeout errors - just let them fail normally
    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      console.log("⏱️ Request timeout - not logging out user");
      return Promise.reject(error);
    }

    // Check if user is SUSPENDED
    // Suspended users should be logged out immediately
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "USER_SUSPENDED"
    ) {
      console.log("User account is suspended - logging out immediately");

      // Clear Redux state
      store.dispatch({ type: "auth/setToken", payload: null });
      store.dispatch({ type: "profile/setUser", payload: null });
      store.dispatch({ type: "cart/resetCart" });

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Show suspension message with toast
      toast.error(
        error.response?.data?.message || "Your account has been suspended.",
      );

      // Redirect handled by PrivateRoute observing token state

      return Promise.reject(error);
    }

    // Check if user's ROLE has been CHANGED
    // Force re-login to get new permissions
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "ROLE_CHANGED"
    ) {
      console.log("User role has been changed - forcing re-login");

      // Clear Redux state
      store.dispatch({ type: "auth/setToken", payload: null });
      store.dispatch({ type: "profile/setUser", payload: null });
      store.dispatch({ type: "cart/resetCart" });

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Show role change message
      toast.error(
        error.response?.data?.message ||
          "Your account role has been changed. Please login again.",
      );

      // Redirect handled by PrivateRoute observing token state

      return Promise.reject(error);
    }

    // Check if token is INVALID (malformed, wrong signature, etc.)
    // For invalid tokens, immediately logout without trying to refresh
    if (
      error.response?.status === 401 &&
      (error.response?.data?.code === "TOKEN_INVALID" ||
        error.response?.data?.message?.toLowerCase().includes("invalid")) &&
      !originalRequest._retry
    ) {
      console.log("Token is invalid - logging out user immediately");

      // Clear Redux state
      store.dispatch({ type: "auth/setToken", payload: null });
      store.dispatch({ type: "profile/setUser", payload: null });
      store.dispatch({ type: "cart/resetCart" });

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect handled by PrivateRoute observing token state

      return Promise.reject(error);
    }

    // Check if token is EXPIRED (time-based expiration)
    // For expired tokens, try to refresh using refresh token
    // Check if token is EXPIRED (time-based expiration) or MISSING
    // For expired/missing tokens, try to refresh using refresh token
    // We are more permissive here to catch cases where backend might not send specific code
    if (
      error.response?.status === 401 &&
      (error.response?.data?.code === "TOKEN_EXPIRED" ||
        error.response?.data?.message?.toLowerCase().includes("expired") ||
        error.response?.data?.message === "Token Missing") &&
      !originalRequest._retry
    ) {
      console.log(
        "🔄 Interceptor detected Expired/Missing Token. Attempting Refresh...",
      );

      if (isRefreshing) {
        console.log("⏳ Refresh already in progress, queuing request...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🚀 Calling /auth/refresh endpoint...");
        // Call refresh endpoint using raw axios to avoid interceptor recursion
        const response = await axios.post(
          `${
            process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"
          }/auth/refresh`,
          {},
          {
            withCredentials: true, // Send refresh token cookie
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        // Check for token in response.data.data.token (standard responseHandler format)
        // or response.data.token (direct format fallback)
        const newToken = response.data?.data?.token || response.data?.token;

        if (response.data.success && newToken) {
          console.log(
            "✅ Token refresh API Success! New Token:",
            newToken?.substring(0, 10) + "...",
          );

          // Update token in Redux store
          store.dispatch({ type: "auth/setToken", payload: newToken });

          // Update axios instance default header
          axiosInstance.defaults.headers.common["Authorization"] =
            `Bearer ${newToken}`;

          // Update original request header
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          // Process queued requests with new token
          processQueue(null, newToken);

          isRefreshing = false;

          // Retry original request with new token and clean config
          const retryConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };

          console.log("🚀 Retrying original request with new token...");
          return axiosInstance(retryConfig);
        } else {
          console.error(
            "❌ Refresh API returned success:false or no token",
            response.data,
          );
          throw new Error("No token in refresh response");
        }
      } catch (refreshError) {
        console.error(
          "❌ Refresh Failed:",
          refreshError.response?.data || refreshError.message,
        );
        processQueue(refreshError, null);
        isRefreshing = false;

        console.log("Refresh token failed - logging out user");

        // Clear Redux state
        store.dispatch({ type: "auth/setToken", payload: null });
        store.dispatch({ type: "profile/setUser", payload: null });
        store.dispatch({ type: "cart/resetCart" });

        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Show user-friendly message
        // Note: Import toast at top if not already imported
        // For now, using alert as fallback
        if (typeof window !== "undefined") {
          alert("Your session has expired. Please login again to continue.");
        }

        // Redirect handled by PrivateRoute observing token state

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};
