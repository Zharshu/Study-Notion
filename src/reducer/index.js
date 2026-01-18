import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../store/slices/authSlice";
import profileReducer from "../features/student/slices/profileSlice";
import cartReducer from "../features/student/slices/cartSlice";
import courseReducer from "../features/instructor/slices/courseSlice";
import viewCourseReducer from "../store/slices/viewCourseSlice";
import adminReducer from "../store/slices/adminSlice";
import categoryReducer from "../store/slices/categorySlice";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  cart: cartReducer,
  course: courseReducer,
  viewCourse: viewCourseReducer,
  admin: adminReducer,
  category: categoryReducer,
});

export default rootReducer;
