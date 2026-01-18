import { createSlice } from "@reduxjs/toolkit";

//Token   wapas kaise milta hai?
//Jab app reload hoti hai, initial state me:

// Helper function to safely parse JSON from localStorage
//Yani, localStorage se token read karke Redux store me wapas set ho jata hai.
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
  signupData: null,//Jab user signup form submit karta hai, OTP verify hone tak data yahan store hota hai.
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
    setToken(state, value) {//Redux store me token update karta hai.
//Agar token hai, to localStorage me bhi save karta hai (taaki refresh pe bhi login rahe).
//Agar token null hai, to localStorage se hata deta hai (logout pe).

//Tokken ->  2 zgh save hua localStroge,redux me 
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