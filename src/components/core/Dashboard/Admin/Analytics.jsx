import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAnalytics } from "../../../../services/operations/adminAPI";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { token } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  // Default to Current Year
  const currYear = new Date().getFullYear();
  const defaultStartDate = `${currYear}-01-01`;
  const defaultEndDate = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const fetchAnalytics = async (start = defaultStartDate, end = defaultEndDate) => {
    setLoading(true);
    const result = await getAnalytics(token, start, end);
    if (result) {
      setAnalytics(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
        fetchAnalytics(startDate, endDate);
    }
  }, [token]);

  const handleFilter = () => {
      fetchAnalytics(startDate, endDate);
  };

  const handleGetFullAnalytics = () => {
      setStartDate("");
      setEndDate("");
      fetchAnalytics("", "");
  };

  const handleReset = () => {
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
      fetchAnalytics(defaultStartDate, defaultEndDate);
  };

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // Chart Options
  const commonOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: "#C5C7D4" },
      },
      title: { display: false },
    },
    scales: {
      y: {
        ticks: { color: "#C5C7D4" },
        grid: { color: "#424854" },
      },
      x: {
        ticks: { color: "#C5C7D4" },
        grid: { color: "#424854" },
      },
    },
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: "#C5C7D4" },
      },
    },
  };
  
  // Generate Random Colors
  const generateColors = (num) => {
      const colors = [];
      for(let i=0; i<num; i++) {
          const hue = Math.floor((360 / num) * i);
          colors.push(`hsl(${hue}, 70%, 50%)`);
      }
      return colors;
  };

  // Data Preparation
  const userGrowthData = {
    labels: analytics?.userGrowth?.labels || [],
    datasets: [
      {
        label: "New Users",
        data: analytics?.userGrowth?.data || [],
        borderColor: "#E7C009",
        backgroundColor: "rgba(231, 192, 9, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const categoryCount = analytics?.coursesByCategory?.length || 0;
  const categoryColors = generateColors(categoryCount > 0 ? categoryCount : 5);

  const categoryData = {
    labels: analytics?.coursesByCategory?.map(c => c.category) || [],
    datasets: [
      {
        label: "Courses",
        data: analytics?.coursesByCategory?.map(c => c.count) || [],
        backgroundColor: categoryColors,
        borderColor: "#161D29",
        borderWidth: 1,
      },
    ],
  };

  // Top Courses Data
  const topCoursesData = {
    labels: analytics?.topCourses?.map((c) => c.name) || [],
    datasets: [
      {
        label: "Enrollments",
        data: analytics?.topCourses?.map((c) => c.enrollments) || [],
        backgroundColor: "#EC4899", // Pink-500
        borderColor: "#EC4899",
        borderWidth: 1,
        barThickness: 50,
      },
    ],
  };

  // Top Instructors Data
  const topInstructorsData = {
    labels: analytics?.topInstructors?.map((i) => i.name) || [],
    datasets: [
      {
        label: "Students",
        data: analytics?.topInstructors?.map((i) => i.students) || [],
        backgroundColor: "#3B82F6", // Blue-500
        borderColor: "#3B82F6",
        borderWidth: 1,
        barThickness: 20,
      },
    ],
  };

  return (
    <div>
      <div className="flex flex-col gap-5 mb-6">
        <h1 className="text-2xl font-bold text-richblack-5">
            Platform Analytics
        </h1>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-x-2">
              <button 
                  onClick={handleGetFullAnalytics}
                  className="bg-richblack-700 text-richblack-50 border border-richblack-500 px-4 py-2 rounded-md font-bold hover:scale-95 transition-all text-sm"
              >
                  Get Full Analytics
              </button>
              <button 
                  onClick={handleReset}
                  className="bg-richblack-700 text-richblack-50 border border-richblack-500 px-4 py-2 rounded-md font-bold hover:scale-95 transition-all text-sm"
              >
                  Clear
              </button>
            </div>
            <div className="flex gap-2 items-center bg-richblack-800 p-2 rounded-md border border-richblack-700">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-richblack-300">Start Date</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-richblack-700 text-richblack-5 rounded p-1 text-sm outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-richblack-300">End Date</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-richblack-700 text-richblack-5 rounded p-1 text-sm outline-none"
                    />
                </div>
                <button 
                    onClick={handleFilter}
                    className="bg-yellow-50 text-richblack-900 px-3 py-1 rounded-md font-bold hover:scale-95 transition-all text-sm self-end h-[34px]"
                >
                    Apply
                </button>
            </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
          <p className="text-richblack-300 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-2" style={{ color: "#28a745" }}>
            ₹{analytics?.totalRevenue?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
          <p className="text-richblack-300 text-sm">Total Enrollments</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {analytics?.totalEnrollments?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
          <p className="text-richblack-300 text-sm">Active Users</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {analytics?.activeUsers || "0"}
          </p>
        </div>
        <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
          <p className="text-richblack-300 text-sm">Total Courses</p>
          <p className="text-3xl font-bold text-pink-400 mt-2">
            {analytics?.totalCourses || "0"}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth */}
        <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
           <h2 className="text-xl font-semibold text-richblack-5 mb-4">
            User Growth (Last 6 Months)
          </h2>
          <div className="h-64">
             {analytics?.userGrowth?.labels?.length > 0 ? (
               <Line options={commonOptions} data={userGrowthData} />
             ) : (
               <div className="h-full grid place-items-center text-richblack-300">
                 No Data Available
               </div>
             )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700">
          <h2 className="text-xl font-semibold text-richblack-5 mb-4">
            Category Distribution
          </h2>
          <div className="h-64">
            {analytics?.coursesByCategory?.length > 0 ? (
              <Doughnut options={doughnutOptions} data={categoryData} />
            ) : (
              <div className="h-full grid place-items-center text-richblack-300">
                No Data Available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Courses */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-richblack-5 mb-4">
          Top Performing Courses
        </h2>
        <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700 h-96">
          {analytics?.topCourses?.length > 0 ? (
            <Bar options={commonOptions} data={topCoursesData} />
          ) : (
            <div className="h-full grid place-items-center text-richblack-300">
              No Data Available
            </div>
          )}
        </div>
      </div>

      {/* Top Instructors */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-richblack-5 mb-4">
          Top Instructors
        </h2>
        <div className="bg-richblack-800 p-6 rounded-md border border-richblack-700 h-96">
          {analytics?.topInstructors?.length > 0 ? (
            <Bar options={commonOptions} data={topInstructorsData} />
          ) : (
            <div className="h-full grid place-items-center text-richblack-300">
              No Data Available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
