import { createSlice } from "@reduxjs/toolkit";

// Helper function to safely parse JSON from localStorage
const safeJSONParse = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const initialState = {
  signupData: null,
  loading: false,
  token: safeJSONParse("token", null),
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setToken(state, value) {
      console.log("Setting token in authSlice:", value.payload);
      state.token = value.payload;
      if (value.payload) {
        try {
          localStorage.setItem("token", JSON.stringify(value.payload));
          console.log("Token saved to localStorage");
        } catch (error) {
          console.error("Error saving token to localStorage:", error);
        }
      } else {
        localStorage.removeItem("token");
        console.log("Token removed from localStorage");
      }
    },
  },
});

export const { setSignupData, setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;