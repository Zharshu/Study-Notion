import { toast } from "react-hot-toast";

import { setLoading, setToken } from "../../store/slices/authSlice";
import { resetCart } from "../../features/student/slices/cartSlice";
import { setUser } from "../../features/student/slices/profileSlice";
import { apiConnector } from "../api/client";
import { endpoints } from "../api/endpoints";

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  GOOGLE_LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints;

export function sendOtp(email, navigate) {
  return async (dispatch) => {
    //Thunk function me ek function return karte ho jiska parameter dispatch hota hai. ye redux thunk function
    // ki pechan hai aur iski power ye hai ki hum isko khi se bhi call kr skte hai
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
      toast.error("Request timed out. Please try again.");
    }, 10000); // 10 second timeout

    try {
      console.log("Sending OTP to email:", email);
      console.log("SENDOTP_API:", SENDOTP_API);

      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      });
      console.log("SENDOTP API RESPONSE............", response);

      console.log("Response data:", response.data);
      console.log("Response success:", response.data.success);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send OTP");
      }

      clearTimeout(timeoutId);
      toast.success("OTP Sent Successfully");
      if (navigate) {
        navigate("/verify-email"); //User ko /verify-email page par redirect kiya jata hai (navigate function se).
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.log("SENDOTP API ERROR............", error);
      console.log("Error response:", error.response);
      console.log("Error message:", error.message);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message.includes("timeout")) {
        toast.error(
          "Request timed out. Please check your internet connection."
        );
      } else {
        toast.error(
          "Could Not Send OTP. Please check your email and try again."
        );
      }
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  otp,
  navigate
) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      });

      console.log("SIGNUP API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      toast.success("Signup Successful");
      navigate("/login"); /////User ko login page par bhej diya jata hai, taki wo ab apne naye credentials se login kare.
      //Login karte hi usko JWT token milta hai, aur wo dashboard ya profile page par redirect ho jata hai.
    } catch (error) {
      console.log("SIGNUP API ERROR............", error);
      toast.error("Signup Failed");
      navigate("/signup");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
        // Remove checkUserPresent if it's not needed for login
      });

      console.log("LOGIN API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Login Successful");

      // Access token and user from response.data.data
      const { token, user } = response.data.data;

      dispatch(setToken(token));
      const userImage = user?.image
        ? user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
      dispatch(setUser({ ...user, image: userImage }));

      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard/my-profile");
    } catch (error) {
      console.log("LOGIN API ERROR............", error);
      toast.error("Login Failed");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function signInWithGoogle(token, accountType, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Logging in with Google...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", GOOGLE_LOGIN_API, {
        token,
        accountType
      });

      console.log("GOOGLE LOGIN API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Google Login Successful");

      const { token: jwtToken, user } = response.data.data;

      dispatch(setToken(jwtToken));
      const userImage = user?.image
        ? user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
      dispatch(setUser({ ...user, image: userImage }));

      localStorage.setItem("token", JSON.stringify(jwtToken));
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard/my-profile");
    } catch (error) {
      console.log("GOOGLE LOGIN API ERROR............", error);
      toast.error(error?.response?.data?.message || "Google Login Failed");
      navigate("/login");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null));
    dispatch(setUser(null));
    dispatch(resetCart());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged Out");
    if (typeof navigate === "function") {
      navigate("/");
    }
  };
}

export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      });

      console.log("RESET PASSWORD TOKEN RESPONSE....", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Reset Email Sent");
      setEmailSent(true);
    } catch (error) {
      console.log("RESET PASSWORD TOKEN Error", error);
      toast.error("Failed to send email for resetting password");
    }
    dispatch(setLoading(false));
  };
}

export function resetPassword(password, confirmPassword, token) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      });

      console.log("RESET Password RESPONSE ... ", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Password has been reset successfully");
    } catch (error) {
      console.log("RESET PASSWORD TOKEN Error", error);
      toast.error("Unable to reset password");
    }
    dispatch(setLoading(false));
  };
}
