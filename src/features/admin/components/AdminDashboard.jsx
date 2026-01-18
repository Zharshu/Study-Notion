import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAdminDashboard } from "../api/adminAPI";
import { Link } from "react-router-dom";

export default function AdminHome() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const data = await getAdminDashboard(token);
      if (data) {
        setDashboardData(data);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">
          Hello {user?.firstName} 👋
        </h1>
        <p className="text-richblack-200 mt-2">
          Welcome to Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      {dashboardData && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Users */}
            <div className="rounded-lg bg-richblack-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-richblack-300">Total Users</p>
                  <p className="text-3xl font-bold text-richblack-5 mt-2">
                    {dashboardData.users.total}
                  </p>
                  <div className="mt-2 text-xs text-richblack-400">
                    <span className="text-green-500">+{dashboardData.users.newThisMonth}</span> this month
                  </div>
                </div>
                <div className="rounded-full bg-blue-500/20 p-4">
                  <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Courses */}
            <div className="rounded-lg bg-richblack-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-richblack-300">Total Courses</p>
                  <p className="text-3xl font-bold text-richblack-5 mt-2">
                    {dashboardData.courses.total}
                  </p>
                  <div className="mt-2 text-xs text-richblack-400">
                    {dashboardData.courses.published} published
                  </div>
                </div>
                <div className="rounded-full bg-green-500/20 p-4">
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="rounded-lg bg-richblack-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-richblack-300">Pending Courses</p>
                  <p className="text-3xl font-bold text-yellow-50 mt-2">
                    {dashboardData.pendingActions.courses}
                  </p>
                  <Link to="/dashboard/admin/courses" className="mt-2 text-xs text-yellow-50 underline">
                    Review Now →
                  </Link>
                </div>
                <div className="rounded-full bg-purple-500/20 p-4">
                  <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Featured Courses */}
            <div className="rounded-lg bg-richblack-800 p-6">
              <p className="text-sm text-richblack-300">Featured Courses</p>
              <p className="text-3xl font-bold text-richblack-5 mt-2">
                {dashboardData.courses.featured}
              </p>
              <div className="mt-2 text-xs text-richblack-400">
                {10 - dashboardData.courses.featured} slots left
              </div>
            </div>
          </div>

          {/* User breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-lg bg-richblack-800 p-6">
              <p className="text-sm text-richblack-300">Students</p>
              <p className="text-2xl font-bold text-blue-400 mt-2">
                {dashboardData.users.students}
              </p>
            </div>
            <div className="rounded-lg bg-richblack-800 p-6">
              <p className="text-sm text-richblack-300">Instructors</p>
              <p 
                className="text-2xl font-bold mt-2"
                style={{
                  color: '#86EFAC',
                  fontWeight: 'bold'
                }}
              >
                {dashboardData.users.instructors}
              </p>
            </div>
            <div className="rounded-lg bg-richblack-800 p-6">
              <p className="text-sm text-richblack-300">Admins</p>
              <p className="text-2xl font-bold text-yellow-300 mt-2">
                {dashboardData.users.admins}
              </p>
            </div>
          </div>

          {/* Recent Activity - Scrollable */}
          <div className="rounded-lg bg-richblack-800 p-6">
            <h2 className="text-xl font-bold text-richblack-5 mb-4">
              Recent Admin Actions
            </h2>
            {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-richblack-700 rounded-md"
                  >
                    <div>
                      <p className="text-sm text-richblack-5">
                        {activity.admin?.firstName} {activity.admin?.lastName}{" "}
                        performed <span className="text-yellow-50">{activity.action}</span>
                      </p>
                      <p className="text-xs text-richblack-400 mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-richblack-300">No recent activity</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg bg-richblack-800 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-richblack-5 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Link
                to="/dashboard/admin/users"
                className="p-4 bg-richblack-700 rounded-lg text-center hover:bg-richblack-600 transition-all"
              >
                <p className="text-richblack-5 font-semibold">Manage Users</p>
              </Link>
              <Link
                to="/dashboard/admin/courses"
                className="p-4 bg-richblack-700 rounded-lg text-center hover:bg-richblack-600 transition-all"
              >
                <p className="text-richblack-5 font-semibold">Review Courses</p>
              </Link>
              <Link
                to="/dashboard/admin/categories"
                className="p-4 bg-richblack-700 rounded-lg text-center hover:bg-richblack-600 transition-all"
              >
                <p className="text-richblack-5 font-semibold">Manage Categories</p>
              </Link>
              <Link
                to="/dashboard/admin/analytics"
                className="p-4 bg-richblack-700 rounded-lg text-center hover:bg-richblack-600 transition-all"
              >
                <p className="text-richblack-5 font-semibold">View Analytics</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

