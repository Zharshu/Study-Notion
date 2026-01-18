import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/public/Home";
import Navbar from "./shared/components/layout/Navbar";
import OpenRoute from "./components/core/Auth/OpenRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Dashboard from "./pages/dashboard/Dashboard";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Error from "./pages/public/Error";
import Settings from "./components/core/Dashboard/Settings";
import { useDispatch, useSelector } from "react-redux";
import EnrolledCourses from "./features/student/components/EnrolledCourses/EnrolledCourses";
import Cart from "./features/student/components/Cart";
import { ACCOUNT_TYPE } from "./utils/constants";
import AddCourse from "./features/instructor/components/CreateCourse";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./features/instructor/components/EditCourse";
import Catalog from "./pages/catalog/Catalog";
import CourseDetails from "./pages/catalog/CourseDetails";
import ViewCourse from "./pages/catalog/ViewCourse";
import VideoDetails from "./components/course/VideoDetails";
import Instructor from "./features/instructor/components/Dashboard/Instructor";
// Admin Dashboard Components
import AdminDashboard from "./components/core/Dashboard/Admin/AdminDashboard";
import UserManagement from "./components/core/Dashboard/Admin/UserManagement";
import CourseModeration from "./components/core/Dashboard/Admin/CourseModeration";
import CategoryManagement from "./components/core/Dashboard/Admin/CategoryManagement";
import Analytics from "./components/core/Dashboard/Admin/Analytics";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.profile);

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />
      <div className="pt-14">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="catalog/:catalogName" element={<Catalog />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />

          <Route
            path="signup"
            element={
              <OpenRoute>
                <Signup />
              </OpenRoute>
            }
          />
          <Route
            path="login"
            element={
              <OpenRoute>
                <Login />
              </OpenRoute>
            }
          />

          <Route
            path="forgot-password"
            element={
              <OpenRoute>
                <ForgotPassword />
              </OpenRoute>
            }
          />

          <Route
            path="verify-email"
            element={
              <OpenRoute>
                <VerifyEmail />
              </OpenRoute>
            }
          />

          <Route
            path="update-password/:id"
            element={
              <OpenRoute>
                <UpdatePassword />
              </OpenRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            {/*Nested Route Yeh saare routes tabhi render honge jab parent Dashboard component render hoga.*/}
            <Route path="dashboard/my-profile" element={<MyProfile />} />

            <Route path="dashboard/Settings" element={<Settings />} />

            {user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path="dashboard/cart" element={<Cart />} />
                <Route
                  path="dashboard/enrolled-courses"
                  element={<EnrolledCourses />}
                />
              </>
            )}

            {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path="dashboard/instructor" element={<Instructor />} />
                <Route path="dashboard/add-course" element={<AddCourse />} />
                <Route path="dashboard/my-courses" element={<MyCourses />} />
                <Route
                  path="dashboard/edit-course/:courseId"
                  element={<EditCourse />}
                />
              </>
            )}

            {user?.accountType === ACCOUNT_TYPE.ADMIN && (
              <>
                <Route path="dashboard/admin" element={<AdminDashboard />} />
                <Route
                  path="dashboard/admin/users"
                  element={<UserManagement />}
                />
                <Route
                  path="dashboard/admin/courses"
                  element={<CourseModeration />}
                />
                <Route
                  path="dashboard/admin/categories"
                  element={<CategoryManagement />}
                />
                <Route
                  path="dashboard/admin/analytics"
                  element={<Analytics />}
                />
              </>
            )}
          </Route>

          <Route
            path="view-course/:courseId"
            element={
              <PrivateRoute>
                <ViewCourse />
              </PrivateRoute>
            }
          >
            {(user?.accountType === ACCOUNT_TYPE.STUDENT ||
              user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) && (
              <>
                <Route
                  path="section/:sectionId/sub-section/:subSectionId"
                  element={<VideoDetails />}
                />
              </>
            )}
          </Route>

          <Route path="*" element={<Error />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
