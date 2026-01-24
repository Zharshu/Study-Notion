import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPlatformStats } from "../../../../services/operations/adminAPI";
import { VscPerson, VscBook, VscGraph, VscCheck } from "react-icons/vsc";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className={`bg-richblack-800 p-6 rounded-md border border-richblack-700`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-richblack-300 text-sm">{title}</p>
          <p className="text-3xl font-bold text-richblack-5 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="text-2xl" />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const result = await getPlatformStats(token);
      console.log("Admin Dashboard Stats Result:", result);
      console.log("coursesByStatus:", result?.coursesByStatus);
      if (result) {
        setStats(result);
      }
      setLoading(false);
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-richblack-5">
          Hi {user?.firstName} 👋
        </h1>
        <p className="font-medium text-richblack-200">
          Let's manage your platform today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || "0"}
          icon={VscPerson}
          color="bg-yellow-900/20 text-yellow-200"
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses || "0"}
          icon={VscBook}
          color="bg-blue-900/20 text-blue-200"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingCourses || "0"}
          icon={VscCheck}
          color="bg-pink-900/20 text-pink-200"
        />
        <StatCard
          title="Total Revenue"
          value={(
            <span style={{ color: "#4ADE80" }}>
              ₹{stats?.totalRevenue || "0"}
            </span>
          )}
          icon={VscGraph}
          color="bg-green-900/20 text-green-200"
        />
      </div>

      {/* User Breakdown */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-richblack-5 mb-4">
          User Statistics
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
            <p className="text-richblack-300 text-sm">Students</p>
            <p className="text-2xl font-bold text-richblack-5 mt-2">
              {stats?.usersByRole?.Student || "0"}
            </p>
          </div>
          <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
            <p className="text-richblack-300 text-sm">Instructors</p>
            <p className="text-2xl font-bold text-richblack-5 mt-2">
              {stats?.usersByRole?.Instructor || "0"}
            </p>
          </div>
          <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
            <p className="text-richblack-300 text-sm">Admins</p>
            <p className="text-2xl font-bold text-richblack-5 mt-2">
              {stats?.usersByRole?.Admin || "0"}
            </p>
          </div>
        </div>
      </div>

      {/* Course Status */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-richblack-5 mb-4">
          Course Status
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
            <p className="text-richblack-300 text-sm">Approved Courses</p>
            <p className="text-2xl font-bold mt-2" style={{ color: "#4ADE80" }}>
              {stats?.coursesByStatus?.Approved || "0"}
            </p>
          </div>
          <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
            <p className="text-richblack-300 text-sm">Pending Courses</p>
            <p className="text-2xl font-bold text-yellow-400 mt-2">
              {stats?.coursesByStatus?.Pending || "0"}
            </p>
          </div>
          <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
            <p className="text-richblack-300 text-sm">Rejected Courses</p>
            <p className="text-2xl font-bold text-pink-400 mt-2">
              {stats?.coursesByStatus?.Rejected || "0"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-richblack-5 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/dashboard/admin/users"
            className="bg-richblack-800 p-4 rounded-md border border-richblack-700 hover:bg-richblack-700 transition-all"
          >
            <p className="text-richblack-5 font-medium">Manage Users</p>
            <p className="text-richblack-300 text-sm mt-1">
              View and manage all users
            </p>
          </Link>
          <Link
            to="/dashboard/admin/courses"
            className="bg-richblack-800 p-4 rounded-md border border-richblack-700 hover:bg-richblack-700 transition-all"
          >
            <p className="text-richblack-5 font-medium">Course Moderation</p>
            <p className="text-richblack-300 text-sm mt-1">
              Approve or reject courses
            </p>
          </Link>
          <Link
            to="/dashboard/admin/categories"
            className="bg-richblack-800 p-4 rounded-md border border-richblack-700 hover:bg-richblack-700 transition-all"
          >
            <p className="text-richblack-5 font-medium">Manage Categories</p>
            <p className="text-richblack-300 text-sm mt-1">
              Create and organize categories
            </p>
          </Link>
          <Link
            to="/dashboard/admin/analytics"
            className="bg-richblack-800 p-4 rounded-md border border-richblack-700 hover:bg-richblack-700 transition-all"
          >
            <p className="text-richblack-5 font-medium">View Analytics</p>
            <p className="text-richblack-300 text-sm mt-1">
              Platform insights and trends
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
