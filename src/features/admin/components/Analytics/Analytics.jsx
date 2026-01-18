import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAdminDashboard, getAnalyticsChartData } from "../../api/adminAPI";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-hot-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

export default function Analytics() {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchStats = async (startDate = null, endDate = null) => {
    setLoading(true);
    const data = await getAdminDashboard(token, startDate, endDate);
    if (data) {
      setStats({
        users: data.users.total,
        courses: data.courses.total,
        categories: 0,
        students: data.users.students,
        instructors: data.users.instructors,
        newUsers: data.users.newThisMonth,
        dateRange: data.dateRange,
      });
    }
    setLoading(false);
  };

  const fetchChartData = async (startDate = null, endDate = null) => {
    setChartLoading(true);
    const data = await getAnalyticsChartData(token, startDate, endDate);
    if (data) {
      // Format data for charts
      const formattedUserGrowth = data.userGrowth.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: item.users,
        students: item.students,
        instructors: item.instructors,
      }));

      const formattedRevenueData = data.revenueData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: item.revenue,
        enrollments: item.enrollments,
      }));

      setChartData({
        userGrowth: formattedUserGrowth,
        revenueData: formattedRevenueData,
        categoryData: data.categoryDistribution.filter(cat => cat.name), // Filter out null categories
      });
    }
    setChartLoading(false);
  };

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  const handleApplyFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchStats(dateRange.startDate, dateRange.endDate);
      fetchChartData(dateRange.startDate, dateRange.endDate);
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">Platform Analytics</h1>

      {/* Date Range Filter */}
      <div className="rounded-lg bg-richblack-800 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-richblack-5 mb-4">Filter by Date Range</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
          <div>
            <label className="text-sm text-richblack-200">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="mt-1 rounded-md bg-richblack-700 p-2 text-richblack-5 w-full"
            />
          </div>
          <div>
            <label className="text-sm text-richblack-200">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="mt-1 rounded-md bg-richblack-700 p-2 text-richblack-5 w-full"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            className="rounded-md bg-yellow-50 px-6 py-2 font-semibold text-richblack-900 hover:bg-yellow-100 w-full sm:w-auto min-h-[44px]"
          >
            Apply Filter
          </button>
          <button
            onClick={() => {
              setDateRange({ startDate: "", endDate: "" });
              fetchStats();
            }}
            className="rounded-md bg-richblack-700 px-6 py-2 text-richblack-5 hover:bg-richblack-600 w-full sm:w-auto min-h-[44px]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {stats?.dateRange && (
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-yellow-400">
              Showing data from <strong>{new Date(stats.dateRange.startDate).toLocaleDateString()}</strong> to <strong>{new Date(stats.dateRange.endDate).toLocaleDateString()}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="grid place-items-center min-h-[300px]">
          <div className="spinner"></div>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Users */}
            <div className="rounded-lg bg-richblack-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-richblack-300">Total Users</p>
                  <p className="text-3xl font-bold text-richblack-5 mt-2">
                    {stats.users || 0}
                  </p>
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
                    {stats.courses || 0}
                  </p>
                </div>
                <div className="rounded-full bg-green-500/20 p-4">
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            {/* New Users */}
            {stats.newUsers !== undefined && (
              <div className="rounded-lg bg-richblack-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-richblack-300">New Users</p>
                    <p className="text-3xl font-bold text-richblack-5 mt-2">
                      {stats.newUsers || 0}
                    </p>
                    <p className="text-xs text-richblack-400 mt-1">
                      {stats.dateRange ? 'In selected range' : 'Last 30 days'}
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-500/20 p-4">
                    <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Students */}
            {stats.students !== undefined && (
              <div className="rounded-lg bg-richblack-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-richblack-300">Students</p>
                    <p className="text-3xl font-bold text-richblack-5 mt-2">
                      {stats.students || 0}
                    </p>
                  </div>
                  <div className="rounded-full bg-cyan-500/20 p-4">
                    <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          {chartData && (
            <div className="space-y-6">
              {/* User Growth Chart - Simplified */}
              <div className="rounded-lg bg-richblack-800 p-6">
                <h3 className="text-lg font-semibold text-richblack-5 mb-4">📈 User Growth Trend</h3>
                <p className="text-sm text-richblack-400 mb-4">Total new users registered per day</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} 
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      name="New Users" 
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue & Enrollment Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-lg bg-richblack-800 p-6">
                  <h3 className="text-lg font-semibold text-richblack-5 mb-4">💰 Revenue Analytics</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-lg bg-richblack-800 p-6">
                  <h3 className="text-lg font-semibold text-richblack-5 mb-4">🎯 Category Distribution</h3>
                  {chartData.categoryData && chartData.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-richblack-400">
                      <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-center">No category data available</p>
                      <p className="text-sm text-richblack-500 mt-2">Create and approve courses to see distribution</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Info Message */}
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-6">
        <div className="flex items-start gap-3">
          <svg className="h-6 w-6 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-400">Advanced Analytics with Recharts</h3>
            <p className="text-sm text-richblack-300 mt-1">
              Visual analytics are now enabled! Charts show user growth trends, revenue analytics, and category distribution. 
              Data updates based on your selected date range filter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

