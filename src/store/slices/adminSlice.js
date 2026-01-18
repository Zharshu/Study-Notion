import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dashboardData: null,
  users: [],
  courses: [],
  loading: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setDashboardData(state, action) {
      state.dashboardData = action.payload;
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
    setCourses(state, action) {
      state.courses = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setDashboardData, setUsers, setCourses, setLoading } = adminSlice.actions;
export default adminSlice.reducer;
