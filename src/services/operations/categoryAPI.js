import { apiConnector } from "../api/client";
import { categories } from "../api/endpoints";
import { setCategories, setLoading } from "../../store/slices/categorySlice";

export function fetchCourseCategories() {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("GET", categories.CATEGORIES_API);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      dispatch(setCategories(response.data.data));
    } catch (error) {
      console.log("COURSE_CATEGORIES_API API ERROR....", error);
    }
    dispatch(setLoading(false));
  };
}
