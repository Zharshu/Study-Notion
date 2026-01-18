import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getAllCourses,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  featureCourse,
} from "../../api/adminAPI";
import { toast } from "react-hot-toast";

export default function CourseModeration() {
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    if (activeTab === "Pending") {
      const data = await getPendingCourses(token);
      setCourses(data || []);
    } else {
      const filters = activeTab !== "all" ? { approvalStatus: activeTab } : {};
      const data = await getAllCourses(token, 1, filters);
      setCourses(data?.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [activeTab]);

  const handleApprove = async (courseId) => {
    const result = await approveCourse(token, courseId);
    if (result) {
      fetchCourses();
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    const result = await rejectCourse(token, selectedCourse._id, rejectionReason);
    if (result) {
      fetchCourses();
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedCourse(null);
    }
  };

  const handleFeature = async (courseId) => {
    const result = await featureCourse(token, courseId);
    if (result) {
      fetchCourses();
    }
  };

  const tabs = [
    { key: "all", label: "All Courses" },
    { key: "Pending", label: "Pending Approval" },
    { key: "Approved", label: "Approved" },
    { key: "Rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">Course Moderation</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-richblack-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 sm:px-4 py-2 font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "border-b-2 border-yellow-50 text-yellow-50"
                : "text-richblack-200 hover:text-richblack-5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="grid place-items-center min-h-[400px]">
          <div className="spinner"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-lg bg-richblack-800 p-8 text-center">
          <p className="text-richblack-300">No courses found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="relative rounded-lg bg-richblack-800 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
            >
              {/* Thumbnail */}
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="h-48 sm:h-32 w-full sm:w-48 rounded-lg object-cover flex-shrink-0"
              />

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-richblack-5 truncate">
                      {course.courseName}
                    </h3>
                    <p className="text-xs sm:text-sm text-richblack-300 mt-1 truncate">
                      by {course.instructor?.firstName} {course.instructor?.lastName}
                    </p>
                </div>
                  {/* Status Badge - Top Right with Inline Styles */}
                  <div className="absolute top-4 right-4 flex flex-wrap gap-2 items-center" style={{ zIndex: 10 }}>
                    {course.featured && (
                      <span 
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{ 
                          backgroundColor: '#D97706', 
                          color: '#FFFFFF',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        ⭐ Featured
                      </span>
                    )}
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: course.approvalStatus === "Approved" 
                          ? '#16A34A'  // green-600
                          : course.approvalStatus === "Rejected"
                          ? '#DC2626'  // red-600
                          : '#D97706', // yellow-600
                        color: '#FFFFFF',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        display: 'inline-block'
                      }}
                    >
                      {course.approvalStatus}
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-richblack-200 mt-2 line-clamp-2 overflow-hidden">
                  {course.courseDescription}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-richblack-300">
                  <span>₹{course.price}</span>
                  <span>•</span>
                  <span>{course.studentsEnrolled?.length || 0} students</span>
                  <span>•</span>
                  <span>{course.category?.name}</span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.approvalStatus === "Pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(course._id)}
                        className="rounded px-3 py-1 text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: '#4ADE80',
                          color: '#052e16',
                          border: 'none'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowRejectModal(true);
                        }}
                        className="rounded px-3 py-1 text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: '#F87171',
                          color: '#450a0a',
                          border: 'none'
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {course.approvalStatus === "Approved" && !course.featured && (
                    <button
                      onClick={() => handleFeature(course._id)}
                      className="rounded bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                    >
                      ⭐ Feature
                    </button>
                  )}
                  
                  {course.rejectionReason && (
                    <div className="mt-2 rounded bg-red-500/10 px-3 py-2 text-xs text-red-400">
                      Reason: {course.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black bg-opacity-50">
          <div className="w-11/12 max-w-md rounded-lg bg-richblack-800 p-6">
            <h2 className="text-xl font-bold text-richblack-5">Reject Course</h2>
            <p className="mt-2 text-richblack-200">
              Reject "{selectedCourse?.courseName}"?
            </p>
            <textarea
              placeholder="Reason for rejection (will be sent to instructor)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-4 w-full rounded-md bg-richblack-700 p-3 text-richblack-5"
              rows="4"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedCourse(null);
                }}
                className="rounded bg-richblack-700 px-4 py-2 text-richblack-5"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Reject Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

